import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';

import Leaderboard from "./leaderboard.jsx";
import Picks from "./picks.jsx";
import { fetchAPI } from "./api_requests.js";
import { theme } from './theme.js';

import "./playoff_bracket.css";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { ThemeProvider } from '@mui/material/styles';
import { v7 } from "uuid";

const LEADERBOARD_FOCUS = 0;
const PICKS_FOCUS = 1;

const apiName = 'apiplayoffbrackets';

const currentYear = 2025;

function getOrCreateDeviceID( ) 
{
   // Get device ID from local browser cache
   let deviceID = localStorage.getItem( 'deviceID' );
   if ( !deviceID )
   {
      // Generate a random UUID and store it on local browser cache
      deviceID = v7( );
      localStorage.setItem('deviceID', deviceID);
   }
   return deviceID;
}

function PlayoffBracket( )
{
   const [ focus, setFocus ] = useState( LEADERBOARD_FOCUS );
   const [ allBrackets, setAllBrackets ] = useState( [ ] );
   const [ picks, setPicks ] = useState( "0000000000000" );
   const [ newBracketSubmitted, setNewBracketSubmitted ] = useState( false );
   const [ winningPicks, setWinningPicks ] = useState( "0000000000000" );
   const [ playoffTeams, setPlayoffTeams ] = useState( { } );
   const [ groups, setGroups ] = useState( [ ] );
   const [ group, setGroup ] = useState( "" );
   const [ loadStatus, setLoadStatus ] = useState( "Loading brackets..." );

   const [ searchParams ] = useSearchParams( );

   const deviceID = getOrCreateDeviceID( );

   // Update the group based on the URL
   useEffect( ( ) => {
      const groupParam = searchParams.get( "group" );
      let newGroup;

      // If the group is null, contains 20+ characters, or contains invalid characters,
      // default group to "All"
      if ( groupParam && /^[A-Za-z0-9!?]{1,20}$/.test( groupParam ) )
      {
         newGroup = groupParam;
      }
      else
      {
         newGroup = "All";
      }
      
      setGroup( newGroup );

   }, [ searchParams ] );
   
   // API call to fetch teams, brackets, and groups when the page loads
   useEffect( ( ) =>
   {
      // Teams
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
         console.log( "Error fetching teams: " + e );
         setLoadStatus( "Error fetching teams" );
      });

      // Brackets and groups
      fetchAPI( apiName, `/brackets/${currentYear}` )
      .then( response => {
         // Groups
         const groups = response.map( bracket =>
         {
            const group = bracket.key.substring( 4 );
            return group;
         }).filter( group => /^[A-Za-z0-9!?]{1,20}$/.test( group ) );

         setGroups( [ ...new Set( groups ) ] );

         // Brackets
         let brackets = [];
         response.forEach( player =>
         {
            if ( !player.brackets || player.brackets.length === 0 )
            {
               console.error("Player " + player.player + " has no brackets");
            }
            else
            {
               player.brackets.forEach((bracket, bracketIndex) =>
                  brackets.push({
                     name: player.player,
                     group: player.key.substring( 4 ),
                     bracketIndex: bracketIndex,
                     picks: bracket.picks,
                     tiebreaker: bracket.tiebreaker,
                     // The following 3 fields will be populated by calculatePoints.
                     // Default to nominal values for now.
                     points: 0,
                     maxPoints: 0,
                     superBowlWinner: "N1",
                     // Temporary
                     devices: player.devices
                  })
               );

               if ( player.devices && player.devices.includes( deviceID ) )
               {
                  console.log( "This is player " + player.player + " with device ID " + deviceID );
               }
            }
         });
   
         setAllBrackets( brackets );
      })
      .catch( e => {
         setLoadStatus( "Error fetching brackets" );
         console.log( "Error fetching brackets: " + e );
      });
   }, [ deviceID, newBracketSubmitted ] );

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

   return (
      <main id="playoff-bracket"><ThemeProvider theme={theme}>
         <h1>{ currentYear } Playoff Bracket</h1>

         <div id="focus-selection-group">
            <ToggleButtonGroup
               onChange={switchFocus}
               value={focus}
               exclusive
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

         <ThemeProvider theme={theme}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
               <FormControl id="group-selection" variant="outlined" sx={{ minWidth: 120 }} size="small">
                  <InputLabel id="group-selection-input-label" style={{ color: "white" }}>Group</InputLabel>
                  <Select
                     id="group-selection-select"
                     value={ group }
                     label="Group"
                     onChange={ ( event ) => setGroup( event.target.value ) }
                     style={{ color: "white" }}
                     autoWidth
                  >
                     <MenuItem value={"All"}> All </MenuItem>
                     { groups.map( ( group, index ) => <MenuItem value={group} key={index}> {group} </MenuItem> )}
                  </Select>
               </FormControl>
            </div>
         </ThemeProvider>

         <div id="playoff-bracket-content" style={{ marginLeft: `${ focus * -100 }vw` }}>
            <Leaderboard
               setPicks={setPicks}
               switchFocus={switchFocus}
               winningPicks={winningPicks}
               playoffTeams={playoffTeams}
               group={group}
               allBrackets={allBrackets}
               loadStatus={loadStatus}
               setLoadStatus={setLoadStatus}
            />
            <Picks
               deviceID={deviceID}
               currentYear={currentYear}
               picks={picks}
               setPicks={setPicks}
               setNewBracketSubmitted={setNewBracketSubmitted}
               playoffTeams={playoffTeams}
               group={group}
               switchFocus={switchFocus}
            />
         </div>

         <div id="playoff-bracket-background-picture" />
      </ThemeProvider></main>
   );
}

export { PlayoffBracket as default, getOrCreateDeviceID };
