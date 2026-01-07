import { fetchAPI, postAPI, deleteAPI } from "./api_requests.js";

const apiName = "apiplayoffbrackets";

export async function submitBracket( setSubmitStatus, deviceID, picks, tiebreaker, setReloadBrackets, currentYear, group, switchFocus, currentBracket, displayName, setDeviceDisplayNameInGroup )
{
   let brackets = [ ];
   let devices = [ ];
   let playerFound = false;
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
      // First check if there are any existing brackets for this player
      response.forEach( player =>
      {
         if ( ( player && player.devices && player.devices.includes( deviceID ) && player.player !== "GROUP_INFO" ) )
         {
            // This device has been used by this player before
            playerFound = true;
            brackets = player.brackets;
            devices = player.devices;
            return true; // break
         }

         if ( player.player === displayName )
         {
            // This player is already in this group but on a new device, add this device to their list
            playerFound = true;
            brackets = player.brackets;
            devices = player.devices.concat( deviceID );
            return true; // break
         }
      });

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
            throw Error( `This bracket is already in this group (${displayName} #${indexOfMatchingBracket + 1})` );
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
         player: displayName,
         brackets: brackets,
         devices: devices
      };
   
      // Send POST request to database API with this data
      postAPI( apiName, "/brackets", bracketData )
      .then( response =>
      {
         setSubmitStatus( "Success" );
         setReloadBrackets( oldValue => !oldValue );
         switchFocus( 0 );
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

export async function deleteBracket( setSubmitStatus, deviceID, setReloadBrackets, currentYear, switchFocus, currentBracket )
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
         if ( ( player && player.devices && player.devices.includes( deviceID ) && player.player !== "GROUP_INFO" )  )
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
      brackets = brackets.filter( ( entry, index ) => ( index !== currentBracket.bracketIndex ) );

      // Check if the player should be removed entirely from this group
      if ( brackets.length === 0 )
      {
         // No more brackets - Remove this player from the group
         deleteAPI( apiName, `/brackets/${encodeURIComponent( currentYear )}/${encodeURIComponent( currentBracket.group )}/${encodeURIComponent( name )}` )
         .then( response =>
         {
            setSubmitStatus( "Success" );
            setReloadBrackets( oldValue => !oldValue );
            switchFocus( 0 );
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
         setReloadBrackets( oldValue => !oldValue );
         switchFocus( 0 );
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

export async function changeDisplayName( setSubmitStatus, currentYear, group, oldName, setReloadBrackets, switchFocus, newName )
{
   let brackets = [ ];
   let devices = [ ];
   let playerFound = false;

   // Fetch this player's information
   fetchAPI( apiName, `/brackets/${encodeURIComponent( currentYear )}/${encodeURIComponent( group )}` )
   .then( response =>
   {
      response.forEach( player =>
      {
         if ( player && player.player && player.player === oldName )
         {
            // This player is in this group
            playerFound = true;
            brackets = player.brackets;
            devices = player.devices;
         }
      });

      if ( !playerFound )
      {
         setSubmitStatus( `Player "${oldName}" not found in group "${group}"` );
         return;
      }

      let bracketData = {
         key: `${currentYear}${group}`,
         player: newName,
         brackets: brackets,
         devices: devices
      };
   
      // Send POST request to database API with this data
      postAPI( apiName, "/brackets", bracketData )
      .then( response =>
      {
         // Delete the old player entry
         deleteAPI( apiName, `/brackets/${encodeURIComponent( currentYear )}/${encodeURIComponent( group )}/${encodeURIComponent( oldName )}` )
         .then( response =>
         {
            setReloadBrackets( oldValue => !oldValue );
            switchFocus( 0 );
         })
         .catch( err =>
         {
            console.error( err );
         });
      })
      .catch( err =>
      {
         console.error( err );
      });
   })
   .catch( err =>
   {
      console.error( err );
   });
}
