import { fetchAPI, postAPI, deleteAPI } from "./api_requests.js";

const apiName = "apiplayoffbrackets";

export async function submitBracket( setSubmitStatus, deviceID, picks, tiebreaker, setNewBracketSubmitted, currentYear, group, switchFocus, currentBracket )
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

   setSubmitStatus( ( !currentBracket || currentBracket.bracketIndex < 0 )
      ? "Adding bracket to group..."
      : "Saving..."
   );

   // Check if this player is already in this group
   fetchAPI( apiName, `/brackets/${encodeURIComponent( currentYear )}/${encodeURIComponent( group )}` )
   .then( response =>
   {
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

      // If the device isn't recognized, prompt for a name and check if it is already in this group
      if ( !playerFound )
      {
         name = prompt( "Enter your Display Name:" );
         if ( !name )
         {
            throw Error( "Bracket not added to group" );
         }
         if ( !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( name ) )
         {
            throw Error( "Invalid Name \"" + name + "\" - Must be less than 20 of the following characters: A-Za-z0-9 /:'[],.<>?~!@#$%^&*+()`_-" );
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
               let confirm = window.confirm(`${name} - You have ${player.brackets.length} bracket${ ( player.brackets.length === 1 ) ? "" : "s"} in the group.\nDo you want to add another?`);
               if ( !confirm )
               {
                  throw Error( "Bracket not added to group" );
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
         if ( indexOfMatchingBracket !== -1 )
         {
            throw Error( `This bracket is already in this group (${name} #${indexOfMatchingBracket + 1})` );
         }

         // Check if this is a new bracket or an edit to a previous bracket
         if ( currentBracket && currentBracket.bracketIndex >= 0 &&
              brackets && currentBracket.bracketIndex < brackets.length )
         {
            // Edit - Replace bracket at given index
            brackets[ currentBracket.bracketIndex ] = bracket;
         }
         else
         {
            // New bracket - Add to end of list
            brackets.push( bracket );
         }
      }

      let bracketData = {
         key: `${currentYear}${group}`,
         player: name,
         brackets: brackets,
         devices: devices
      };
   
      // Send POST request to database API with this data
      postAPI( apiName, "/brackets", bracketData )
      .then( response =>
      {
         setSubmitStatus( "Success" );
         setNewBracketSubmitted( oldValue => !oldValue );
         switchFocus( null, 0 );
      })
      .catch( err =>
      {
         if ( err.message !== "Bracket not added to group" )
         {
            console.error( err );
         }
         setSubmitStatus( ( !currentBracket || currentBracket.bracketIndex < 0 )
            ? "Error adding bracket to group"
            : "Error saving bracket"
         );
      });
   })
   .catch( err =>
   {
      console.error( err );
      setSubmitStatus( err.message );
   });
}

export async function deleteBracket( setSubmitStatus, deviceID, setNewBracketSubmitted, currentYear, switchFocus, currentBracket )
{
   let brackets = [ ];
   let devices = [ ];
   let name = "";
   let playerFound = false;

   if ( !currentBracket || currentBracket.bracketIndex < 0 )
   {
      setSubmitStatus( "Select a bracket to delete" );
      return;
   }

   if ( !currentBracket.group || currentBracket.group === "All" )
   {
      setSubmitStatus( "Select a group to delete this bracket" );
      return;
   }

   setSubmitStatus( "Deleting bracket from database..." );

   // Check if this player is already in this group
   fetchAPI( apiName, `/brackets/${encodeURIComponent( currentYear )}/${encodeURIComponent( currentBracket.group )}` )
   .then( response =>
   {
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

      if ( !playerFound )
      {
         throw Error( `This bracket cannot be found in group ${currentBracket.group}` );
      }

      // Remove bracket at given index
      console.log( brackets );
      brackets = brackets.filter( ( entry, index ) => ( index !== currentBracket.bracketIndex ) );
      console.log( brackets );

      // Check if the player should be removed entirely from this group
      if ( brackets.length === 0 )
      {
         // No more brackets - Remove this player from the group
         deleteAPI( apiName, `/brackets/${encodeURIComponent( currentYear )}/${encodeURIComponent( currentBracket.group )}/${encodeURIComponent( name )}` )
         .then( response =>
         {
            console.log( response );
            setSubmitStatus( "Success" );
            setNewBracketSubmitted( oldValue => !oldValue );
            switchFocus( null, 0 );
         })
         .catch( err =>
         {
            setSubmitStatus( "Error deleting bracket from group" );
         });

         return;
      }

      // Otherwise, player still has other brackets in this group. POST data with this bracket removed

      let bracketData = {
         key: `${currentYear}${currentBracket.group}`,
         player: name,
         brackets: brackets,
         devices: devices
      };
   
      // Send POST request to database API with this data
      postAPI( apiName, "/brackets", bracketData )
      .then( response =>
      {
         setSubmitStatus( "Success" );
         setNewBracketSubmitted( oldValue => !oldValue );
         switchFocus( null, 0 );
      })
      .catch( err =>
      {
         setSubmitStatus( "Error deleting bracket from group" );
      });
   })
   .catch( err =>
   {
      console.error( err );
      setSubmitStatus( err.message );
   });
}
