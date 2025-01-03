import { fetchAPI, postAPI } from "./api_requests.js";

const apiName = "apiplayoffbrackets";

export default async function submitBracket( setSubmitStatus, deviceId, picks, tiebreaker, setNewBracketSubmitted, currentYear, group, switchFocus, currentBracket )
{
   let brackets = [ ];
   let devices = [ ];
   let playerFound = false;
   let name = "";
   let bracket = {
      picks: picks,
      tiebreaker: tiebreaker
   };

   if ( !group || group === "All" )
   {
      setSubmitStatus( "Select a group to submit this bracket" );
      return;
   }
      
   if ( !picks || !/^[1-2]{13}$/.test( picks ) )
   {
      setSubmitStatus( "Invalid picks" );
      return;
   }

   if ( !tiebreaker || !/^[0-9]{1,}$/.test( tiebreaker ) || isNaN( parseInt( tiebreaker ) ) || parseInt( tiebreaker ) < 0 )
   {
      setSubmitStatus( "Invalid tiebreaker (total score)" );
      return;
   }

   if ( currentBracket && currentBracket.bracketIndex >= 0 )
   {
      setSubmitStatus( ( currentBracket && currentBracket.bracketIndex >= 0 ) ? "Saving..." : "Adding bracket to database..." );
   }

   // Check if this player is already in this group
   fetchAPI( apiName, `/brackets/${currentYear}/${group}` )
   .then( response => {
      // First check if this device has been used in the past
      response.forEach( player =>
      {
         if ( ( player.devices && player.devices.includes( deviceId ) )  )
         {
            // This device has been used by this player before
            playerFound = true;
            name = player.player;
            if ( player.brackets.find( entry => entry.picks === bracket.picks && entry.tiebreaker === bracket.tiebreaker ) )
            {
               throw Error( "Bracket is already in database" );
            }

            // Check if this is a new bracket or an edit to a previous bracket
            if ( currentBracket && currentBracket.bracketIndex >= 0 &&
                 player.brackets && currentBracket.bracketIndex < player.brackets.length )
            {
               // Replace bracket at given index
               brackets = player.brackets
               brackets[ currentBracket.bracketIndex ] = bracket;
            }
            else
            {
               // Add new bracket to the end of the list
               brackets = player.brackets.concat( bracket );
            }

            // Keep the device list
            devices = player.devices;
         }
      });

      // Prompt for a name and check if it is already in the database
      if ( !playerFound )
      {
         name = prompt( "Enter your Display Name:" );
         if ( !name || !/^[A-Za-z0-9 !?/\\'"[\]()_-]{1,20}$/.test( name ) )
         {
            throw Error( "Invalid Name \"" + name + "\" - Must be less than 20 of the following characters: A-Za-z0-9 !?/\\'\"[]()_-" );
         }
         brackets = [ bracket ];
         devices = [ deviceId ];

         // Check if this player is already in this group (on a different device)
         response.forEach( player =>
         {
            if ( player.player === name )
            {
               // This player is already in this group, add this device to their list
               playerFound = true;
               let cancel = window.confirm(`${player.name} - You have ${player.brackets.length} bracket${ ( player.brackets.length === 1 ) ? "" : "s"} in the database.\nDo you want to add another?`);
               if ( cancel )
               {
                  setSubmitStatus( "Bracket not added to database" );
                  return;
               }
               if ( player.brackets.find( entry => entry.picks === bracket.picks && entry.tiebreaker === bracket.tiebreaker ) )
               {
                  setSubmitStatus( "Bracket is already in database" );
                  return;
               }

               // Check if this is a new bracket or an edit to a previous bracket
               if ( currentBracket && currentBracket.bracketIndex >= 0 &&
                    player.brackets && currentBracket.bracketIndex < player.brackets.length )
               {
                  // Replace bracket at given index
                  brackets = player.brackets
                  brackets[ currentBracket.bracketIndex ] = bracket;
               }
               else
               {
                  // Add new bracket to the end of the list
                  brackets = player.brackets.concat( bracket );
               }

               // Add this new device to the player's list
               devices = player.devices.concat( deviceId );
            }
         });
      }

      let bracketData = {
         key: `2025${group}`,
         player: name,
         brackets: brackets,
         devices: devices
      };
   
      // Send POST request to database API with this data
      postAPI( apiName, "/brackets", bracketData )
      .then( response => {
         setSubmitStatus( "Success" );
         setNewBracketSubmitted( oldValue => !oldValue );
         switchFocus( null, 0 );
      })
      .catch( err => {
         console.error( err );
         setSubmitStatus( "Error adding bracket to database" );
      });
   })
   .catch( err => {
      console.error( err );
      setSubmitStatus( err.message );
   });
}
