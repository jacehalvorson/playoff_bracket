import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from 'react-router-dom';

import Leaderboard from "./leaderboard.jsx";
import Picks from "./picks.jsx";
import { fetchAPI, postAPI } from "./api_requests.js";
import { theme } from './theme.js';
import { computeRoundWinners } from "./bracket_utils.js";
import CustomPopup from "./Popup.jsx";

import "./playoff_bracket.css";

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { ThemeProvider } from '@mui/material/styles';
import { v7 } from "uuid";
import * as CryptoJS from "crypto-js";

const LEADERBOARD_FOCUS = 0;
const PICKS_FOCUS = 1;

const apiName = 'apiplayoffbrackets';

const currentYear = 2026;

const secretKey = process.env.REACT_APP_SECRET_KEY || 'default_secret';

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
   const [ focus, setFocus ] = useState( LEADERBOARD_FOCUS );
   const [ allBrackets, setAllBrackets ] = useState( null );
   const [ picks, setPicks ] = useState( "0000000000000" );
   const [ tiebreaker, setTiebreaker ] = useState( "" );
   const [ reloadBrackets, setReloadBrackets ] = useState( false );
   const [ winningPicks, setWinningPicks ] = useState( "0000000000000" );
   const [ playoffTeams, setPlayoffTeams ] = useState( {
      "N1": { name: "Lions", conference: "N", seed: 1 },
      "N2": { name: "Eagles", conference: "N", seed: 2 },
      "N3": { name: "Buccaneers", conference: "N", seed: 3 },
      "N4": { name: "Rams", conference: "N", seed: 4 },
      "N5": { name: "Vikings", conference: "N", seed: 5 },
      "N6": { name: "Commanders", conference: "N", seed: 6 },
      "N7": { name: "Packers", conference: "N", seed: 7 },
      "A1": { name: "Chiefs", conference: "A", seed: 1 },
      "A2": { name: "Bills", conference: "A", seed: 2 },
      "A3": { name: "Ravens", conference: "A", seed: 3 },
      "A4": { name: "Texans", conference: "A", seed: 4 },
      "A5": { name: "Chargers", conference: "A", seed: 5 },
      "A6": { name: "Steelers", conference: "A", seed: 6 },
      "A7": { name: "Broncos", conference: "A", seed: 7 }
   } );
   const [ groups, setGroups ] = useState( [ ] );
   const [ group, setGroup ] = useState( "All" );
   const [ loadStatus, setLoadStatus ] = useState( <h3>Loading brackets...</h3> );
   const [ currentBracket, setCurrentBracket ] = useState( null );
   const [ gamesStarted, setGamesStarted ] = useState( false );
   const [ reloadTiebreaker, setReloadTiebreaker] = useState( false );
   const [ teamsLoaded, setTeamsLoaded ] = useState( false );
   const [ roundWinners, setRoundWinners ] = useState( [ [ ], [ ], [ ], [ ] ] );
   const [ isPasswordWindowOpen, setIsPasswordWindowOpen ] = useState( false );
   const [ targetGroupObject, setTargetGroupObject ] = useState( { name: "", password: "", devices: [ ] } );
   const [ isIncorrectPassword, setIsIncorrectPassword ] = useState( false );
   const [ passwordInput, setPasswordInput ] = useState( "" );
   const [ searchParams ] = useSearchParams( );
   const deviceID = getOrCreateDeviceID( );

   // Return 0 for unpicked, 1 for correct, and -1 for incorrect
   const isPickCorrect = ( pickIndex, conference, seed ) =>
   {
      if ( winningPicks[ pickIndex ] === "0" )
      {
         return 0;
      }

      const roundIndex =
         ( pickIndex >= 0 && pickIndex < 6 )
            ? 0
            : ( pickIndex >= 6 && pickIndex < 10 )
               ? 1
               : ( pickIndex >= 10 && pickIndex < 12 )
                  ? 2
                  : ( pickIndex === 12 )
                     ? 3
                     : -1;
      if ( roundIndex === -1 )
      {
         return 0;
      }
      
      return ( roundWinners[ roundIndex ].includes( `${conference}${seed.toString( )}` ) )
         ? 1
         : -1;
   }

   const validateAndSwitchToGroup = useCallback(( targetGroup, allGroups ) =>
   {
      if ( targetGroup === 'All' )
      {
         // No validation needed for this group
         setGroup( 'All' );
         localStorage.setItem( 'group', 'All' );
         return;
      }

      const targetGroupObject = allGroups.find( group => group.name === targetGroup );
      if ( !targetGroupObject )
      {
         setLoadStatus( <h3>Unable to switch to group {targetGroup}</h3> );
         return;
      }

      // Bypass the password if the group doesn't have a password or if the device is approved
      if ( !targetGroupObject.password ||
           ( targetGroupObject.devices && targetGroupObject.devices.includes( deviceID ) ))
      {
         setGroup( targetGroupObject.name );
         // Set this group in local storage for next login
         localStorage.setItem( 'group', targetGroupObject.name );
      }
      else
      {
         // Prompt for password
         setTargetGroupObject( targetGroupObject );
         setIsPasswordWindowOpen( true );
      }
   }, [ deviceID ] );

   // API call to fetch teams and other system info when page loads
   useEffect( ( ) =>
   {
      // Teams
      fetchAPI( apiName, `/teams/${currentYear}` )
      .then( response => {
         const winners = response.find( item => item.index === "winners" ).value;
         setWinningPicks( winners );
         setRoundWinners( computeRoundWinners( winners ) );

         setPlayoffTeams( {
            "N1": { name: response.find( item => item.index === "N1" ).value, conference: "N", seed: 1 },
            "N2": { name: response.find( item => item.index === "N2" ).value, conference: "N", seed: 2 },
            "N3": { name: response.find( item => item.index === "N3" ).value, conference: "N", seed: 3 },
            "N4": { name: response.find( item => item.index === "N4" ).value, conference: "N", seed: 4 },
            "N5": { name: response.find( item => item.index === "N5" ).value, conference: "N", seed: 5 },
            "N6": { name: response.find( item => item.index === "N6" ).value, conference: "N", seed: 6 },
            "N7": { name: response.find( item => item.index === "N7" ).value, conference: "N", seed: 7 },
            "A1": { name: response.find( item => item.index === "A1" ).value, conference: "A", seed: 1 },
            "A2": { name: response.find( item => item.index === "A2" ).value, conference: "A", seed: 2 },
            "A3": { name: response.find( item => item.index === "A3" ).value, conference: "A", seed: 3 },
            "A4": { name: response.find( item => item.index === "A4" ).value, conference: "A", seed: 4 },
            "A5": { name: response.find( item => item.index === "A5" ).value, conference: "A", seed: 5 },
            "A6": { name: response.find( item => item.index === "A6" ).value, conference: "A", seed: 6 },
            "A7": { name: response.find( item => item.index === "A7" ).value, conference: "A", seed: 7 }
         } );

         let gamesStarted = response.find( item => item.index === "gamesStarted" );
         if ( gamesStarted && gamesStarted.value && parseInt( gamesStarted.value ) === 1 )
         {
            setGamesStarted( true );
            setPicks( winners );
         }
         else
         {
            setGamesStarted( false );
         }
         
         setTeamsLoaded( true );
      })
      .catch( e => {
         console.error( "Error fetching teams: " + e );
      });
   }, [ ] );

   // API call to fetch brackets when page loads (or when reload is requested)
   useEffect( ( ) =>
   {
      // Brackets and groups
      fetchAPI( apiName, `/brackets/${currentYear}` )
      .then( response => {
         if ( response.length === 0 )
         {
            // No groups or brackets, nothing to be done
            setLoadStatus( <h3>No groups or brackets yet for {currentYear}</h3> );
            return;
         }
            
         // Loop through entries to load groups and brackets
         let fetchedGroups = [];
         let brackets = [];
         response.forEach( response =>
         {
            if ( response.player === "GROUP_INFO" )
            {
               // This is a group info object
               fetchedGroups.push({
                  name: response.key.substring( 4 ),
                  password: response.encryptedPassword,
                  devices: response.devices
               });
            }
            else
            {
               // This is a player object that contains brackets
               response.brackets.forEach((bracket, bracketIndex) =>
                  brackets.push({
                     name: response.player,
                     group: response.key.substring( 4 ),
                     bracketIndex: bracketIndex,
                     picks: bracket.picks,
                     tiebreaker: bracket.tiebreaker,
                     devices: response.devices,
                     // The following 3 fields will be populated by calculatePoints.
                     // Default to nominal values for now.
                     points: 0,
                     maxPoints: 0,
                     superBowlWinner: "N1"
                  })
               );
            }
         });

         setGroups( fetchedGroups );
         setAllBrackets( brackets );
         groupsLoaded.current = true;
      })
      .catch( e => {
         console.log( "Error fetching brackets:");
         console.error( e );
         setLoadStatus( <h3>Error fetching brackets</h3> );
      });
   }, [ reloadBrackets, searchParams, deviceID ] );

   // Select group from URL or local storage
   const groupsLoaded = useRef( false );
   const defaultGroupSelected = useRef( false );
   useEffect( ( ) =>
   {
      // Don't run if groups aren't loaded, and don't run more than once
      if ( !groupsLoaded.current || defaultGroupSelected.current )
      {
         return;
      }
      const groupFromUrl = searchParams.get( "group" );
      const groupFromLocalStorage = localStorage.getItem( 'group' );
      // Priority 1: Check for a group in the URL
      if ( groupFromUrl )
      {
         validateAndSwitchToGroup( groupFromUrl, groups );
      }
      // Priority 2: Check for a group in local storage
      else if ( groupFromLocalStorage )
      {
         validateAndSwitchToGroup( groupFromLocalStorage, groups );
      }
      defaultGroupSelected.current = true;
   }, [ searchParams, groups, validateAndSwitchToGroup ] );

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
      if ( !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( newGroup ) )
      {
         switchFocus( LEADERBOARD_FOCUS );
         setLoadStatus( <h3>Invalid group name "{newGroup}" - Must be 20 or less of the following characters: {"A-Za-z0-9 /:'[],.<>?~!@#$%^&*+()`_-"}</h3> );
         return;
      }
      if ( groups.includes( newGroup ) || newGroup === "All" )
      {
         switchFocus( LEADERBOARD_FOCUS );
         setLoadStatus( <h3>Group "{newGroup}" already exists</h3> );
         return;
      }

      let groupPassword = prompt( "Enter a group password:" );
      if ( !groupPassword )
      {
         // User cancelled, return with no error
         return;
      }

      let groupInfo = {
         key: `${currentYear}${newGroup}`,
         player: "GROUP_INFO",
         encryptedPassword: CryptoJS.AES.encrypt( groupPassword, secretKey ).toString( ),
         devices: [ deviceID ]
      };

      // Send POST request to database API with this data
      postAPI( apiName, "/brackets", groupInfo )
      .then( response =>
      {
         setGroups( groups => [ ...groups, newGroup ] );
         setGroup( newGroup );
         localStorage.setItem( 'group', newGroup );
         setReloadBrackets( oldValue => !oldValue );
      })
      .catch( err =>
      {
         console.error( err );
         alert("Failed to create group");
      });
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

   const passwordSubmitButtonRef = useRef( null );
   useEffect( ( ) =>
   {
      if (isIncorrectPassword) {
         // Delay focus until after DOM updates & animations
         const timer = setTimeout(() => {
         if (passwordSubmitButtonRef.current) {
            passwordSubmitButtonRef.current.focus();
         }
         }, 0); // You can increase delay if you have animations (e.g., 300ms)
   
         return () => clearTimeout(timer); // Cleanup on state change
      }
      else {
         if (passwordInputRef.current) {
            passwordInputRef.current.focus();
         }
      }
   }, [ isIncorrectPassword ] );

   const passwordInputRef = useRef( null );
   useEffect( ( ) =>
   {
      if (isPasswordWindowOpen) {
         // Delay focus until after DOM updates & animations
         const timer = setTimeout(() => {
         if (passwordInputRef.current) {
            passwordInputRef.current.focus();
         }
         }, 0); // You can increase delay if you have animations (e.g., 300ms)

         return () => clearTimeout(timer); // Cleanup on state change
      }
   }, [ isPasswordWindowOpen ] );

   const handlePasswordSubmission = ( ) =>
   {
      if ( passwordInput === CryptoJS.AES.decrypt( targetGroupObject.password, secretKey ).toString( CryptoJS.enc.Utf8 ) )
      {
         setGroup( targetGroupObject.name );
         // Set this group in local storage for next login
         localStorage.setItem( 'group', targetGroupObject.name );
         // Close popup
         setIsPasswordWindowOpen( false );
      }
      else
      {
         setIsIncorrectPassword( true );
      }
   };

   const handlePasswordEnter = ( e ) => {
      if ( e.key === 'Enter' )
      {
         handlePasswordSubmission( );
      }
   };

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
                  {( gamesStarted )
                     ? "Leaderboard"
                     : "Brackets"
                  }
               </ToggleButton>
               <ToggleButton
                  value={1}
                  style={{fontSize: "inherit", width: "9em"}}
                  aria-label="picks button"
               >
                  {( gamesStarted )
                     ? "Bracket"
                     : "Picks"
                  }
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
                     if ( event.target.value === "+ Create New" )
                     {
                        addNewGroup( );
                     }
                     else
                     {
                        validateAndSwitchToGroup( event.target.value, groups );
                     }
                  }}
                  style={{ color: "white" }}
                  autoWidth
               >
                  <MenuItem value={"All"}> All </MenuItem>
                  { groups.map( ( group, index ) => <MenuItem value={group.name} key={index}> {group.name} </MenuItem> )}
                  <MenuItem value={"+ Create New"}> + Create New </MenuItem>
               </Select>
            </FormControl>
         </div>

         <div id="playoff-bracket-content" style={{ marginLeft: `${ focus * -100 }vw` }}>
            <Leaderboard
               switchFocus={switchFocus}
               winningPicks={winningPicks}
               playoffTeams={playoffTeams}
               group={group}
               groups={groups}
               allBrackets={allBrackets}
               loadStatus={loadStatus}
               setLoadStatus={setLoadStatus}
               gamesStarted={gamesStarted}
               deviceID={deviceID}
               leaderboardEntryClick={leaderboardEntryClick}
               teamsLoaded={teamsLoaded}
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
               isPickCorrect={isPickCorrect}
            />
         </div>

         {/* Group password Popup */}
        <CustomPopup
          isOpen={isPasswordWindowOpen}
          onClose={( ) => {setIsPasswordWindowOpen( false ); setIsIncorrectPassword( false );}}
          maxWidth="600px"
        >
          <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '28px', fontWeight: '700' }}>
            Switching to group "{targetGroupObject.name}"
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {( isIncorrectPassword )
            ?
               <h3>Incorrect Password</h3>
            :
               <div>
               <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  Password
               </label>
               <input
                  type="password"
                  style={{
                     width: '100%',
                     padding: '12px 16px',
                     border: '2px solid #e5e7eb',
                     borderRadius: '8px',
                     fontSize: '16px',
                     transition: 'border-color 0.2s',
                     boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  onKeyDown={handlePasswordEnter}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  ref={passwordInputRef}
               />
               </div>
            }

            <button
              style={{
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                marginTop: '8px'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              onClick={() =>
              {
                  if ( isIncorrectPassword ) { setIsIncorrectPassword( false ); }
                  else { handlePasswordSubmission( ); }
              }}
              ref={passwordSubmitButtonRef}
            >
              {( isIncorrectPassword ) ? "Try Again" : "Submit" }
            </button>
          </div>
        </CustomPopup>

         <div id="playoff-bracket-background-picture" />
      </ThemeProvider></main>
   );
}

export { PlayoffBracket as default, getOrCreateDeviceID };
