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
import Button from '@mui/material/Button';
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
      localStorage.setItem( 'deviceID', deviceID );
   }
   return deviceID;
}

function PlayoffBracket( )
{
   const [ focus, setFocus ] = useState( PICKS_FOCUS );
   const [ allBrackets, setAllBrackets ] = useState( [ ] );
   const [ picks, setPicks ] = useState( "0000000000000" );
   const [ tiebreaker, setTiebreaker ] = useState( "" );
   const [ reloadBrackets, setReloadBrackets ] = useState( false );
   const [ winningPicks, setWinningPicks ] = useState( "0000000000000" );
   const [ playoffTeams, setPlayoffTeams ] = useState( { } );
   const [ groups, setGroups ] = useState( [ ] );
   const [ group, setGroup ] = useState( "" );
   const [ loadStatus, setLoadStatus ] = useState( <h3>Loading brackets...</h3> );
   const [ currentBracket, setCurrentBracket ] = useState( null );
   const [ gamesStarted, setGamesStarted ] = useState( false );
   const [reloadTiebreaker, setReloadTiebreaker] = useState( false );

   const [ searchParams ] = useSearchParams( );

   const deviceID = getOrCreateDeviceID( );

   // Update the group based on the URL
   useEffect( ( ) => {
      let newGroup;
      const groupParam = searchParams.get( "group" );
      const lastGroup = localStorage.getItem( 'group' );

      // Look for a group in the user's URL
      if ( groupParam && /^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( groupParam ) && groupParam !== "All" )
      {
         newGroup = groupParam;
         
         // Add the new group to the list of groups if it's not already there
         setGroups( groups => ( groups.includes( newGroup ) )
            ? groups
            : [ ...groups, newGroup ]
         );

         // Set this as the default group for the user
         localStorage.setItem( 'group', newGroup );
      }
      // Look for the group the user last selected
      else if ( lastGroup && /^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( lastGroup ) && lastGroup !== "All" )
      {
         // User has a default group
         newGroup = lastGroup;

         // Add the new group to the list of groups if it's not already there
         setGroups( groups => ( groups.includes( newGroup ) )
            ? groups
            : [ ...groups, newGroup ]
         );
      }
      // Default to all
      else
      {
         newGroup = "All";
      }
      
      setGroup( newGroup );

   }, [ searchParams ] );
   
   // API call to fetch teams and other system info when page loads
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

         let gamesStarted = response.find( item => item.index === "gamesStarted" );
         if ( gamesStarted && gamesStarted.value && parseInt( gamesStarted.value ) === 1 )
         {
            setGamesStarted( true );
            switchFocus( LEADERBOARD_FOCUS );
            setPicks( winners );
         }
         else
         {
            setGamesStarted( false );
         }
      })
      .catch( e => {
         console.error( "Error fetching teams: " + e );
         setLoadStatus( <h3>Error fetching teams</h3> );
      });
   }, [ ] );

   // API call to fetch brackets when page loads (or when reload is requested)
   useEffect( ( ) =>
   {
      // Brackets and groups
      fetchAPI( apiName, `/brackets/${currentYear}` )
      .then( response => {
         // Groups
         const groups = response.map( bracket =>
         {
            return bracket.key.substring( 4 );
         }).filter( group => /^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( group ) );

         setGroups( oldGroups => [ ...new Set( [ ...oldGroups, ...groups ] ) ] );

         // Brackets
         let brackets = [];
         response.forEach( player =>
         {
            player.brackets.forEach((bracket, bracketIndex) =>
               brackets.push({
                  name: player.player,
                  group: player.key.substring( 4 ),
                  bracketIndex: bracketIndex,
                  picks: bracket.picks,
                  tiebreaker: bracket.tiebreaker,
                  devices: player.devices,
                  // The following 3 fields will be populated by calculatePoints.
                  // Default to nominal values for now.
                  points: 0,
                  maxPoints: 0,
                  superBowlWinner: "N1"
               })
            );
         });
   
         setAllBrackets( brackets );
      })
      .catch( e => {
         console.error( "Error fetching brackets: " + e );
         setLoadStatus( <h3>Error fetching brackets</h3> );
      });
   }, [ reloadBrackets ] );

   const focusButtonPressed = ( event, newFocus ) =>
   {
      // Slide the picks screen to main center view
      if ( newFocus !== null )
      {
         switchFocus( newFocus );
      }

      // Reset to "Create a new bracket" screen when pressing the "Picks" button.
      // Exception 1 - When viewing brackets after games have started, the one you click will stay loaded.
      // Exception 2 - When there is no bracket loaded, don't reset the custom picks that the user is about to submit.
      if ( newFocus === PICKS_FOCUS && !gamesStarted && currentBracket )
      {
         setCurrentBracket( null );
         setPicks( "0000000000000" );
         setTiebreaker( "" );
         setReloadTiebreaker( oldValue => !oldValue );
      }
   }

   const switchFocus = ( newFocus ) =>
   {
      setFocus( newFocus );

      // Scroll to top if the user switches screens
      window.scrollTo({
         top: 0,
         behavior: 'smooth'
      });
   }

   const addNewGroup = ( ) =>
   {
      let newGroup = prompt( "Enter a group name:" );
      if ( !newGroup )
      {
         // User cancelled, return with no error
         return;
      }
      else if ( !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( newGroup ) )
      {
         switchFocus( LEADERBOARD_FOCUS );
         setLoadStatus( <h3>Invalid group name "{newGroup}" - Must be 20 or less of the following characters: {"A-Za-z0-9 /:'[],.<>?~!@#$%^&*+()`_-"}</h3> );
         return;
      }

      setGroups( groups => [ ...groups, newGroup ] );
      setGroup( newGroup );
      localStorage.setItem( 'group', newGroup );
   }

   const leaderboardEntryClick = ( bracket ) =>
   {
      setCurrentBracket( bracket );
      setPicks( bracket.picks );
      setTiebreaker( bracket.tiebreaker );
      setReloadTiebreaker( oldValue => !oldValue );
      setGroup( bracket.group );
      switchFocus( PICKS_FOCUS );
   }

   return (
      <main id="playoff-bracket"><ThemeProvider theme={theme}>
         <h1>{ currentYear } Playoff Bracket</h1>

         <div id="focus-selection-group">
            <ToggleButtonGroup
               onChange={focusButtonPressed}
               value={focus}
               exclusive
               aria-label="select-focus"
            >
               <ToggleButton
                  value={0}
                  style={{fontSize: "inherit", width: "9em"}}
                  aria-label="leaderboard button"
               >
                  {(gamesStarted)
                     ? "Leaderboard"
                     : "Brackets"
                  }
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

         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1em" }}>
            <FormControl id="group-selection" variant="outlined" sx={{ minWidth: 120 }} size="small">
               <InputLabel id="group-selection-input-label" style={{ color: "white" }}>Group</InputLabel>
               <Select
                  id="group-selection-select"
                  value={ group }
                  label="Group"
                  onChange={ ( event ) =>
                  {
                     localStorage.setItem( 'group', event.target.value );
                     setGroup( event.target.value )
                  } }
                  style={{ color: "white" }}
                  autoWidth
               >
                  <MenuItem value={"All"}> All </MenuItem>
                  { groups.map( ( group, index ) => <MenuItem value={group} key={index}> {group} </MenuItem> )}
               </Select>
            </FormControl>
            {( gamesStarted )
               ? <></>
               : <Button
                  variant="contained"
                  onClick={ addNewGroup }
                 >
                  New
               </Button>
            }
         </div>

         <div id="playoff-bracket-content" style={{ marginLeft: `${ focus * -100 }vw` }}>
            <Leaderboard
               switchFocus={switchFocus}
               winningPicks={winningPicks}
               playoffTeams={playoffTeams}
               group={group}
               allBrackets={allBrackets}
               loadStatus={loadStatus}
               setLoadStatus={setLoadStatus}
               gamesStarted={gamesStarted}
               deviceID={deviceID}
               leaderboardEntryClick={leaderboardEntryClick}
            />
            <Picks
               deviceID={deviceID}
               currentYear={currentYear}
               picks={picks}
               setPicks={setPicks}
               tiebreaker={tiebreaker}
               setTiebreaker={setTiebreaker}
               setReloadBrackets={setReloadBrackets}
               playoffTeams={playoffTeams}
               group={group}
               switchFocus={switchFocus}
               currentBracket={currentBracket}
               gamesStarted={gamesStarted}
               setCurrentBracket={setCurrentBracket}
               reloadTiebreaker={reloadTiebreaker}
            />
         </div>

         <div id="playoff-bracket-background-picture" />
      </ThemeProvider></main>
   );
}

export { PlayoffBracket as default, getOrCreateDeviceID };
