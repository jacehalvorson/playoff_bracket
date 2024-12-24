import React from "react";
import { CurrentYear } from "./YearUpdate.js";

import PlayoffBracketLeaderboard from "./playoff_bracket_leaderboard.jsx";
// import PlayoffBracketPicks from "./playoff_bracket_picks.jsx";

import "./playoff_bracket.css";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function getOrCreateDeviceId( ) 
{
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
      deviceId = Math.random( ).toString(36).substring(2, 9); // Generate a random string
      localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

function PlayoffBracket( )
{
   // focus is 0 leaderboard and 1 for picks
   const [focus, setFocus] = React.useState( 1 );
   const [picks, setPicks] = React.useState( "0000000000000" );
   const [newBracketSubmitted, setNewBracketSubmitted] = React.useState( false );
   
   React.useEffect( ( ) => {
      setFocus(1);
   }, [ picks ] );

   //newFocus is 0 for leaderboard and 1 for picks
   const switchFocus = (event, newFocus) =>
   {
      if (newFocus !== null)
      {
         setFocus(newFocus);
      }

      // Scroll to top if the user switches to picks
      if (newFocus === 1)
      {
         window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
      }
   }

   // Get the device ID which is common for a single person.
   const deviceId = getOrCreateDeviceId( );

   return (
      <main id="playoff-bracket">
         <h1>{ CurrentYear() } Playoff Bracket</h1>

         <div id="focus-selection-group">
            <ToggleButtonGroup
               onChange={switchFocus}
               value={focus}
               exclusive
               sx={{bgcolor: "white"}}
               aria-label="select-focus"
            >
               <ToggleButton
                  value={0}
                  style={{fontSize: "inherit", width: "9em"}}
                  aria-label="leaderboard button"
               >
                  Leaderboard
               </ToggleButton>
               <ToggleButton
                  value={1}
                  style={{fontSize: "inherit", width: "9em"}}
                  aria-label="picks button"
               >
                  Picks
               </ToggleButton>
            </ToggleButtonGroup>
         </div>

         <div id="playoff-bracket-content" style={{ marginLeft: `${ focus * -100 }vw` }}>
            <PlayoffBracketLeaderboard deviceId={deviceId} setPicks={setPicks} newBracketSubmitted={newBracketSubmitted} />
            {/* <PlayoffBracketPicks deviceId={deviceId} currentYear={CurrentYear()} picks={picks} setPicks={setPicks} setNewBracketSubmitted={setNewBracketSubmitted} /> */}
         </div>

         <div id="playoff-bracket-background-picture" />
      </main>
   );
}

export { PlayoffBracket as default, getOrCreateDeviceId };
