import { Amplify } from "aws-amplify";

const apiName = "apiplayoffbrackets";

export default async function submitBracket( setSubmitStatus, deviceId, picks, tiebreaker, setNewBracketSubmitted )
{
   let brackets = [ ];
   let devices = [ ];
   let playerFound = false;
   let name = "";
   let bracket = {
      picks: picks,
      tiebreaker: tiebreaker
   };

   setSubmitStatus( "Adding bracket to leaderboard..." );

   // Check if this player is already in the database
   Amplify.API.get( apiName, "/?table=playoffBrackets2025" )
   .then( response => {
      // First check if this device has been used in the past
      response.forEach( player =>
      {
         if ( ( player.devices && player.devices.includes( deviceId ) )  )
         {
            playerFound = true;
            let cancel = window.confirm(`${player.name} - You have ${player.brackets.length} bracket${ ( player.brackets.length === 1 ) ? "" : "s"} in the database.\n\
Do you want to add another?\n\nDevice ID: ${deviceId}\nPicks: ${bracket.picks}\nTiebreaker: ${bracket.tiebreaker}`);
            if (!cancel)
            {
               throw Error("Bracket not added to database");;
            }
            name = player.name;
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
         name = prompt( `Device ID: ${deviceId}\nPicks: ${bracket.picks}\nTiebreaker: ${bracket.tiebreaker}\n\nName:` );
         if ( !name )
         {
            throw Error("Bracket not added to database");;
         }
         brackets = [ bracket ];
         devices = [ deviceId ];

         // Check if this player is already in the database (on a different device)
         response.forEach( player =>
         {
            if ( player.name === name )
            {
               playerFound = true;
               let cancel = window.confirm(`${player.name} - You have ${player.brackets.length} bracket${ ( player.brackets.length === 1 ) ? "" : "s"} in the database.\n\
Do you want to add another?\n\nDevice ID: ${deviceId}\nPicks: ${bracket.picks}\nTiebreaker: ${bracket.tiebreaker}`);
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
         name: name,
         brackets: brackets,
         devices: devices
      };
   
      // Send POST request to database API with this data
      Amplify.API.post( apiName, "/?table=playoffBrackets2025", {
         headers: {
            "Content-Type": "application/json"
         },
         body: bracketData
      })
      .then( response => {
         setSubmitStatus( "Success" );
         setNewBracketSubmitted( oldValue => !oldValue );
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
