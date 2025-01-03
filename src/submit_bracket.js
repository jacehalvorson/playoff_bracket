import { fetchAPI, postAPI } from "./api_requests.js";

const apiName = "apiplayoffbrackets";

export default async function submitBracket( setSubmitStatus, deviceID, picks, tiebreaker, setNewBracketSubmitted, currentYear, group, switchFocus, currentBracket, isDeletion )
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
      setSubmitStatus( ( !currentBracket && currentBracket.bracketIndex < 0 )
         ? "Adding bracket to database..."
         : ( isDeletion )
            ? "Deleting bracket from database..."
            : "Saving..."
      );
   }

   // Check if this player is already in this group
   fetchAPI( apiName, `/brackets/${currentYear}/${group}` )
   .then( response => {
      // First check if this device has been used in the past
      response.forEach( player =>
      {
         if ( ( player.devices && player.devices.includes( deviceID ) )  )
         {
            // This device has been used by this player before
            playerFound = true;
            name = player.player;
            brackets = player.brackets;
            devices = player.devices;
         }
      });

      // Prompt for a name and check if it is already in this group
      if ( !playerFound )
      {
         name = prompt( "Enter your Display Name:" );
         if ( !name )
         {
            throw Error( "Bracket not added to database" );
         }
         if ( !/^[A-Za-z0-9 !?/\\'"[\]()_-]{1,20}$/.test( name ) )
         {
            throw Error( "Invalid Name \"" + name + "\" - Must be less than 20 of the following characters: A-Za-z0-9 !?/\\'\"[]()_-" );
         }

         // Check if this player is already in this group (on a different device)
         response.forEach( player =>
         {
            if ( player.player === name )
            {
               // This player is already in this group, add this device to their list
               playerFound = true;
               brackets = player.brackets;
               devices = player.devices.concat( deviceID );
               let confirm = window.confirm(`${name} - You have ${player.brackets.length} bracket${ ( player.brackets.length === 1 ) ? "" : "s"} in the database.\nDo you want to add another?`);
               if ( !confirm )
               {
                  throw Error( "Bracket not added to database" );
               }
            }
         });
      }

      if ( !playerFound )
      {
         // New player - start a list of brackets and devices
         brackets = [ bracket ];
         devices = [ deviceID ];
      }
      else
      {
         const indexOfMatchingBracket = brackets.findIndex( entry => entry.picks === bracket.picks && entry.tiebreaker === bracket.tiebreaker );
         if ( indexOfMatchingBracket !== -1 && !isDeletion )
         {
            throw Error( `This bracket is already in this group (${name} #${indexOfMatchingBracket + 1})` );
         }

         // Check if this is a new bracket, an edit to a previous bracket, or a deletion of a bracket
         if ( currentBracket && currentBracket.bracketIndex >= 0 &&
              brackets && currentBracket.bracketIndex < brackets.length )
         {
            if ( isDeletion )
            {
               // Deletion - Remove bracket at given index
               brackets = brackets.filter( ( entry, index ) => index !== currentBracket.bracketIndex );
            }
            else
            {
               // Edit - Replace bracket at given index
               brackets[ currentBracket.bracketIndex ] = bracket;
            }
         }
         else
         {
            // New bracket - Add to end of list
            brackets.push( bracket );
         }
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
         if ( err.message !== "Bracket not added to database" )
         {
            console.error( err );
         }
         setSubmitStatus( "Error adding bracket to database" );
      });
   })
   .catch( err => {
      console.error( err );
      setSubmitStatus( err.message );
   });
}
