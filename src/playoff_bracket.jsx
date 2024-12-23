import { useState, useEffect } from "react";

import PlayoffBracketLeaderboard from "./playoff_bracket_leaderboard.jsx";
import PlayoffBracketPicks from "./playoff_bracket_picks.jsx";
import { fetchAPI } from "./playoff_bracket_api.js";

import "./playoff_bracket.css";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// const LEADERBOARD_FOCUS = 0;
const PICKS_FOCUS = 1;

const apiName = 'apiplayoffbrackets';

const currentYear = 2025;
const group = "dev";

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
   const [ focus, setFocus ] = useState( PICKS_FOCUS );
   const [ picks, setPicks ] = useState( "0000000000000" );
   const [ newBracketSubmitted, setNewBracketSubmitted ] = useState( false );
   const [ winningPicks, setWinningPicks ] = useState( "0000000000000" );
   const [ playoffTeams, setPlayoffTeams ] = useState( { } );
   
   useEffect( ( ) => {
      fetchAPI( apiName, `/teams/${currentYear}` )
         .then( response => {
            const winners = response.find( item => item.index === "winners" ).value;
            setWinningPicks( winners );

            setPlayoffTeams( {
               "N1": { name: response.find( item => item.index === "N1" ).value, seed: 1 },
               "N2": { name: response.find( item => item.index === "N2" ).value, seed: 2 },
               "N3": { name: response.find( item => item.index === "N3" ).value, seed: 3 },
               "N4": { name: response.find( item => item.index === "N4" ).value, seed: 4 },
               "N5": { name: response.find( item => item.index === "N5" ).value, seed: 5 },
               "N6": { name: response.find( item => item.index === "N6" ).value, seed: 6 },
               "N7": { name: response.find( item => item.index === "N7" ).value, seed: 7 },
               "A1": { name: response.find( item => item.index === "A1" ).value, seed: 1 },
               "A2": { name: response.find( item => item.index === "A2" ).value, seed: 2 },
               "A3": { name: response.find( item => item.index === "A3" ).value, seed: 3 },
               "A4": { name: response.find( item => item.index === "A4" ).value, seed: 4 },
               "A5": { name: response.find( item => item.index === "A5" ).value, seed: 5 },
               "A6": { name: response.find( item => item.index === "A6" ).value, seed: 6 },
               "A7": { name: response.find( item => item.index === "A7" ).value, seed: 7 }
            } );
         })
         .catch( e => {
            console.error( e );
         });
   }, [ ] );

   const switchFocus = (event, newFocus) =>
   {
      if ( newFocus !== null )
      {
         setFocus( newFocus );
      }

      // Scroll to top if the user switches to picks
      if ( newFocus === PICKS_FOCUS )
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
         <h1>{ currentYear } Playoff Bracket</h1>

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
            <PlayoffBracketLeaderboard
               deviceId={deviceId}
               setPicks={setPicks}
               switchFocus={switchFocus}
               newBracketSubmitted={newBracketSubmitted}
               winningPicks={winningPicks}
               playoffTeams={playoffTeams}
            />
            <PlayoffBracketPicks
               deviceId={deviceId}
               currentYear={currentYear}
               picks={picks}
               setPicks={setPicks}
               setNewBracketSubmitted={setNewBracketSubmitted}
               playoffTeams={playoffTeams}
               group={group}
            />
         </div>

         <div id="playoff-bracket-background-picture" />
      </main>
   );
}

export { PlayoffBracket as default, getOrCreateDeviceId };
