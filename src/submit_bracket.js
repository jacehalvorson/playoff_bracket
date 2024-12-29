import { fetchAPI, postAPI } from "./api_requests.js";

const apiName = "apiplayoffbrackets";

export default async function submitBracket( setSubmitStatus, deviceId, picks, tiebreaker, setNewBracketSubmitted, currentYear, group, switchFocus )
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
      setSubmitStatus( "Select a group to submit bracket" );
      return;
   }
      
   if ( !picks || !tiebreaker ||
        !/[1-2]{13}$/.test( picks ) ||
        isNaN( parseInt( tiebreaker ) ) ||
        parseInt( tiebreaker ) < 0 )
   {
      setSubmitStatus( "Invalid input" );
      return;
   }

   setSubmitStatus( "Adding bracket to leaderboard..." );

   // Check if this player is already in this group
   fetchAPI( apiName, `/brackets/${currentYear}/${group}` )
   .then( response => {
      // First check if this device has been used in the past
      response.forEach( player =>
      {
         if ( ( player.devices && player.devices.includes( deviceId ) )  )
         {
            playerFound = true;
            let confirm = window.confirm(`${player.player} - You have ${player.brackets.length} bracket${ ( player.brackets.length === 1 ) ? "" : "s"} in the database.\nDo you want to add another?`);
            if (!confirm)
            {
               throw Error("Bracket submission cancelled");;
            }
            name = player.player;
            if ( player.brackets.find( entry => entry.picks === bracket.picks && entry.tiebreaker === bracket.tiebreaker ) )
            {
               throw Error("Bracket is already in database");
            }
            brackets = player.brackets.concat( bracket );
            devices = player.devices;
         }
      });

      // Prompt for a name and check if it is already in the database
      if (!playerFound)
      {
         name = prompt( `Enter your Display Name:` );
         if ( !name )
         {
            throw Error("Bracket submission cancelled");;
         }
         brackets = [ bracket ];
         devices = [ deviceId ];

         // Check if this player is already in this group (on a different device)
         response.forEach( player =>
         {
            if ( player.player === name )
            {
               playerFound = true;
               let cancel = window.confirm(`${player.name} - You have ${player.brackets.length} bracket${ ( player.brackets.length === 1 ) ? "" : "s"} in the database.\nDo you want to add another?`);
               if (cancel)
               {
                  setSubmitStatus( "Bracket not added to database" );
                  return;
               }
               if ( player.brackets.find( entry => entry.picks === bracket.picks && entry.tiebreaker === bracket.tiebreaker ) )
               {
                  setSubmitStatus( "Bracket is already in database" );
                  return;
               }
               brackets = player.brackets.concat( bracket );
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
      if ( err.message !== "Bracket submission cancelled" )
      {
         console.error( err );
      }
      setSubmitStatus( err.message );
   });
}
