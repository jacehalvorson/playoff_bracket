import { useState, useEffect, useRef } from "react";

import { computeAllGames, getSuffix, emptyGames, nflTeamColors } from "./bracket_utils.js"
import { submitBracket, deleteBracket, changeDisplayName } from "./submit_bracket.js";
import CustomPopup from "./Popup.jsx";

import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';

import "./picks.css";

function Picks( props )
{
   const [games, setGames] = useState( emptyGames );
   const [submitStatus, setSubmitStatus] = useState( "" );
   const [isBracketSubmissionWindowOpen, setIsBracketSubmissionWindowOpen] = useState( false );
   const [displayName, setDisplayName] = useState( "" );
   const [bracketSubmissionStatus, setBracketSubmissionStatus] = useState( "" );
   const [isChangeDisplayNameWindowOpen, setIsChangeDisplayNameWindowOpen] = useState( false );

   const currentYear = props.currentYear
   const deviceID = props.deviceID;
   const picks = props.picks;
   const setPicks = props.setPicks;
   const tiebreaker = props.tiebreaker;
   const setTiebreaker = props.setTiebreaker
   const setReloadBrackets = props.setReloadBrackets;
   const playoffTeams = props.playoffTeams;
   const group = props.group;
   const switchFocus = props.switchFocus;
   const currentBracket = props.currentBracket;
   const setCurrentBracket = props.setCurrentBracket;
   const gamesStarted = props.gamesStarted;
   const reloadTiebreaker = props.reloadTiebreaker;
   const isPickCorrect = props.isPickCorrect;
   const deviceDisplayNameInGroup = props.deviceDisplayNameInGroup;
   const setDeviceDisplayNameInGroup = props.setDeviceDisplayNameInGroup;

   // Used by buttons to select teams. Error checks the new value and updates picks
   const updatePick = ( index, value ) =>
   {
      if ( isNaN( Number( index ) ) || Number( index ) < 0 || Number( index ) > 12 ||
           isNaN( Number( value ) ) || Number( value ) < 0 || Number( value ) > 2 )
      {
         console.error( "Cannot update pick " + index + " with value " + value );
         return;
      }
      if ( gamesStarted )
      {
         // If the games have started, don't allow picks to be changed but don't give an error
         return;
      }

      // Take the existing picks before and after the index, but replace to value at the index
      // e.g., "1121" + "2" + "00000000"
      let newPicks = picks.substring( 0, index ) +
                     value.toString( ) +
                     picks.substring( index + 1 );
      setPicks( newPicks );

      // If current viewing someone else's bracket, change these picks to a new bracket
      if ( currentBracket && currentBracket.devices && !currentBracket.devices.includes( deviceID ) )
      {
         setCurrentBracket( null );
      }
   }

   // Update all the Wild Card games when the playoff teams or picks change
   useEffect( ( ) => {
      setGames( computeAllGames( picks ) );

      // Reset the submit status when the picks change
      setSubmitStatus( "" );
   }, [ picks, playoffTeams ] );

   const handleBracketSubmission = ( ) =>
   {
      if ( !displayName )
      {
         setBracketSubmissionStatus( "Enter a Display Name" );
         return;
      }
      if ( !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( displayName ) || displayName === "GROUP_INFO" )
      {
         setBracketSubmissionStatus( "Invalid Name \"" + displayName + "\" - Must be 20 or less of the following characters: A-Za-z0-9 /:'[],.<>?~!@#$%^&*+()`_-" );
         return;
      }
      if ( !group || group === "All" )
      {
         setBracketSubmissionStatus( "Select a group to submit this bracket" );
         return;
      }

      // Submit the bracket
      submitBracket( setSubmitStatus, deviceID, picks, tiebreaker, setReloadBrackets, currentYear, group, switchFocus, currentBracket, displayName, setDeviceDisplayNameInGroup );
      // Close the dialog
      setIsBracketSubmissionWindowOpen( false );
   }

   const handleChangeDisplayName = ( ) =>
   {
      if ( !displayName )
      {
         // User cancelled, exit with no error
         return;
      }
      
      if ( displayName === currentBracket.name )
      {
         setBracketSubmissionStatus( "New name is the same as the old name" );
         return;
      }
      
      if ( !/^[A-Za-z0-9 /:'[\],.<>?~!@#$%^&*+()`_-]{1,20}$/.test( displayName ) || displayName === "GROUP_INFO" )
      {
         // Invalid name
         setBracketSubmissionStatus( "Invalid Name \"" + displayName + "\" - Must be 20 or less of the following characters: A-Za-z0-9 /:'[],.<>?~!@#$%^&*+()`_-" );
         return;
      }

      // Change the display name
      changeDisplayName( setSubmitStatus, currentYear, group, currentBracket.name, setReloadBrackets, switchFocus, displayName );
      // Close the dialog
      setIsChangeDisplayNameWindowOpen( false );
      setBracketSubmissionStatus( "" );
   }

   const displayNameInputRef = useRef( null );
   useEffect( ( ) =>
   {
      if (isBracketSubmissionWindowOpen) {
         // Delay focus until after DOM updates & animations
         const timer = setTimeout(() => {
         if (displayNameInputRef.current) {
            displayNameInputRef.current.focus();
         }
         }, 0); // You can increase delay if you have animations (e.g., 300ms)
   
         return () => clearTimeout(timer); // Cleanup on state change
      }
   }, [ isBracketSubmissionWindowOpen ] );

   const changeDiplayNameInputRef = useRef( null );
   useEffect( ( ) =>
   {
      if (isChangeDisplayNameWindowOpen) {
         // Delay focus until after DOM updates & animations
         const timer = setTimeout(() => {
         if (changeDiplayNameInputRef.current) {
            changeDiplayNameInputRef.current.focus();
         }
         }, 0); // You can increase delay if you have animations (e.g., 300ms)
   
         return () => clearTimeout(timer); // Cleanup on state change
      }
   }, [ isChangeDisplayNameWindowOpen ] );

   return (
      <div id="playoff-bracket-picks">
         <p style={{textAlign: "center", fontSize: "4em", maxWidth: "70vw"}}>
         {
            ( currentBracket )
            ? ( currentBracket.devices && currentBracket.devices.includes( deviceID ) )
               // Player owns this bracket
               ? `${ currentBracket.name } - ${( gamesStarted ?  "Y" : "Edit y" )}our ` +
                 ( ( currentBracket.bracketIndex > 0 ) 
                     ? ( currentBracket.bracketIndex + 1 ) + getSuffix( currentBracket.bracketIndex + 1 ) + " "
                     : ""
                  ) +
                 "bracket"
               // Another player's bracket
               : currentBracket.name + "'s " +
                 ( ( currentBracket.bracketIndex > 0 )
                     ? ( currentBracket.bracketIndex + 1 ) + getSuffix( currentBracket.bracketIndex + 1 ) + " "
                     : ""
                  ) +
                 "bracket"
            : ( gamesStarted )
               ? ""
               : "Create New Bracket"
         }
         </p>
         {
         ( currentBracket && currentBracket.devices && currentBracket.devices.includes( deviceID ) && currentBracket.name && !gamesStarted )
            ? <>
               <Button
                  variant="text"
                  onClick={ ( ) => { setIsChangeDisplayNameWindowOpen( true ); setBracketSubmissionStatus( "" ); }}
               >
                  Change Display Name
               </Button>
               <Button
                  variant="text"
                  onClick={ ( ) => { setCurrentBracket( null ); }}
               >
                  Create Another Bracket
               </Button>
            </>
            : <></>
         }
         <div id="playoff-bracket-wildcard-games">
            <h2>Wild Card Games</h2>
            <div className="playoff-bracket-afc">
               {games.afcWildcardGames.map( ( game, index ) =>
                  <PlayoffBracketGame
                     game={game}
                     key={index}
                     pickIndex={index}
                     updatePick={updatePick}
                     playoffTeams={playoffTeams}
                     isPickCorrect={isPickCorrect}
                     currentBracket={currentBracket}
                  />
               )}
            </div>
            <div className="playoff-bracket-nfc">
               {games.nfcWildcardGames.map( ( game, index ) =>
                  <PlayoffBracketGame
                     game={game}
                     key={index}
                     pickIndex={index + 3}
                     updatePick={updatePick}
                     playoffTeams={playoffTeams}
                     isPickCorrect={isPickCorrect}
                     currentBracket={currentBracket}
                  />
               )}
            </div>
         </div>

         <div id="playoff-bracket-divisional-games">
            <div className="playoff-bracket-afc">
               <h2>AFC Divisional Games</h2>
               {games.afcDivisionalGames.map( ( game, index ) =>
                  <PlayoffBracketGame
                     game={game}
                     key={index}
                     pickIndex={index + 6}
                     updatePick={updatePick}
                     playoffTeams={playoffTeams}
                     isPickCorrect={isPickCorrect}
                     currentBracket={currentBracket}
                  />
               )}
            </div>
            <div className="playoff-bracket-nfc">
               <h2>NFC Divisional Games</h2>
               {games.nfcDivisionalGames.map( ( game, index ) =>
                  <PlayoffBracketGame
                     game={game}
                     key={index}
                     pickIndex={index + 8}
                     updatePick={updatePick}
                     playoffTeams={playoffTeams}
                     isPickCorrect={isPickCorrect}
                     currentBracket={currentBracket}
                  />
               )}
            </div>
         </div>

         <div id="playoff-bracket-championships">
            <div className="playoff-bracket-afc">
               <h2>AFC Championship</h2>
               <PlayoffBracketGame
                  game={games.afcChampionshipGame}
                  pickIndex={10}
                  updatePick={updatePick}
                  playoffTeams={playoffTeams}
                  isPickCorrect={isPickCorrect}
                  currentBracket={currentBracket}
               />
            </div>
            <div className="playoff-bracket-nfc">
               <h2>NFC Championship</h2>
               <PlayoffBracketGame
                  game={games.nfcChampionshipGame}
                  pickIndex={11}
                  updatePick={updatePick}
                  playoffTeams={playoffTeams}
                  isPickCorrect={isPickCorrect}
                  currentBracket={currentBracket}
               />
            </div>
         </div>

         <div id="playoff-bracket-super-bowl">
            {/* Super Bowl */
            /* In this special case, "homeTeam" is the AFC team
               and "awayTeam" is the NFC team" */}
            <div id="super-bowl">
               <h2>Super Bowl</h2>

               <PlayoffBracketGame
                  game={games.superBowl}
                  pickIndex={12}
                  updatePick={updatePick}
                  playoffTeams={playoffTeams}
                  isPickCorrect={isPickCorrect}
                  currentBracket={currentBracket}
               />

               <div style={{display: "flex", justifyContent: "center", alignItems: "end", gap: "1em"}}>
                  <TextField
                     label="Total Score"
                     id="tiebreaker-input"
                     variant="outlined"
                     size="small"
                     inputMode="decimal"
                     pattern="[0-9]*"
                     type="tel"
                     style={{ marginTop: "1em" }}
                     defaultValue={tiebreaker}
                     key={reloadTiebreaker}
                     onChange={( event ) => {
                        setTiebreaker( event.target.value );
                     }}
                     disabled={gamesStarted}
                  />

                  {/* If the games have started, don't show a submit button */}
                  {( gamesStarted )
                     ? <></>
                     : <Button
                           id="submit-picks-button"
                           variant="contained"
                           disabled=
                           {(
                              // If the input isn't valid don't allow submission
                              !picks || !/^[1-2]{13}$/.test( picks ) ||
                              !tiebreaker || !/^[0-9]{1,}$/.test( tiebreaker ) || isNaN( parseInt( tiebreaker ) ) || parseInt( tiebreaker ) < 0
                           )}
                           color=
                           {
                              // If the user hasn't changed anything, show a red delete option
                              ( currentBracket && currentBracket.picks === picks && currentBracket.tiebreaker === tiebreaker )
                                 ? "error"
                                 : "primary"
                           }
                           size="large"
                           onClick={ ( ) =>
                           {
                              if ( currentBracket && currentBracket.picks === picks && currentBracket.tiebreaker === tiebreaker )
                              {
                                 // This button is a Delete button, delete the bracket
                                 deleteBracket( setSubmitStatus, deviceID, setReloadBrackets, currentYear, switchFocus, currentBracket );
                              }
                              else if ( !deviceDisplayNameInGroup )
                              {
                                 // Open a dialog to prompt for display name
                                 setIsBracketSubmissionWindowOpen( true );
                                 // Bracket will be submitted in a click handler within the dialog
                              }
                              else
                              {
                                 // This button is a Submit/Save button and the display name is is already known, submit/save the bracket
                                 submitBracket( setSubmitStatus, deviceID, picks, tiebreaker, setReloadBrackets, currentYear, group, switchFocus, currentBracket, deviceDisplayNameInGroup, setDeviceDisplayNameInGroup );
                              }
                           }}
                        >
                        {
                           // If no bracket is selected, show "Submit"
                           ( !currentBracket || !currentBracket.devices )
                              ? "Submit"
                              // If the user hasn't changed anything, show a delete option
                              : ( currentBracket.picks === picks && currentBracket.tiebreaker === tiebreaker )
                                 ? "Delete"
                                 // Otherwise, show "Save" (user has made changes to their selected bracket)
                                 : "Save"
                        }
                     </Button>
                  }
               </div>
               
               <h2 id="submit-status" style={{margin: "1em", width: "90vw", textAlign: "center"}}>
                  {submitStatus}
               </h2>
            </div>
         </div>

         {/* Display Name Entry Popup */}
         <CustomPopup
            isOpen={isBracketSubmissionWindowOpen}
            onClose={( ) => {setIsBracketSubmissionWindowOpen( false ); setBracketSubmissionStatus( "" );}}
            maxWidth="600px"
         >
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '28px', fontWeight: '700' }}>
               Enter your Display Name:
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div>
                  <input
                     type="text"
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
                     onKeyDown={(e) => { if (e.key === 'Enter') { handleBracketSubmission( ); } }}
                     onChange={(e) => setDisplayName(e.target.value)}
                     ref={displayNameInputRef}
                  />
               </div>

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
                  onClick={handleBracketSubmission}
               >
                  Submit
               </button>

               <h2 style={{color: 'red'}}>
                  {bracketSubmissionStatus}
               </h2>
            </div>
         </CustomPopup>

         {/* Change Display Name Entry Popup */}
         <CustomPopup
            isOpen={isChangeDisplayNameWindowOpen}
            onClose={( ) => {setIsChangeDisplayNameWindowOpen( false ); setBracketSubmissionStatus( "" );}}
            maxWidth="600px"
         >
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '28px', fontWeight: '700' }}>
               Enter your Display Name:
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div>
                  <input
                     type="text"
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
                     onKeyDown={(e) => { if (e.key === 'Enter') { handleChangeDisplayName( ); } }}
                     onChange={(e) => setDisplayName(e.target.value)}
                     ref={changeDiplayNameInputRef}
                  />
               </div>

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
                  onClick={handleChangeDisplayName}
               >
                  Submit
               </button>

               <h2 style={{color: 'red'}}>
                  {bracketSubmissionStatus}
               </h2>
            </div>
         </CustomPopup>
      </div>
   );
}

function PlayoffBracketGame( props )
{
   const game = props.game;
   const homeTeam = props.playoffTeams[game.homeTeam];
   const awayTeam = props.playoffTeams[game.awayTeam];
   const winner = game.winner;
   const pickIndex = props.pickIndex;
   const isPickCorrect = props.isPickCorrect;
   const currentBracket = props.currentBracket;

   // Place items at the end in the super bowl
   const justifyContentValue = ( pickIndex === 12 ) ? "flex-end" : "flex-start";

   const changeHandler = ( event, newWinner ) =>
   {
      // If deselected, set to 0.
      // Otherwise, set to the new winner (1 for home or 2 for away)
      props.updatePick( pickIndex, ( newWinner === null ) ? 0 : newWinner );
   }
   
   return (
      <ToggleButtonGroup className="playoff-bracket-game"
                         onChange={changeHandler}
                         exclusive
                         value={winner}
                         style={{ borderRadius: "1em" }}
      >
         {[ homeTeam, awayTeam ].map( ( team, index ) =>
         {
            let backgroundColor = "white";
            if ( ( winner === ( index + 1 ) ) && team && team.conference && team.seed )
            {
               // This team is predicted to win
               if ( currentBracket && isPickCorrect( pickIndex, team.conference, team.seed ) === 1 )
               {
                  // Correct pick
                  backgroundColor = "#4a934a";
               }
               else if ( currentBracket && isPickCorrect( pickIndex, team.conference, team.seed ) === -1 )
               {
                  // Incorrect pick
                  backgroundColor = "#ed4337";
               }
               else
               {
                  // No result yet
                  if ( team.name && nflTeamColors[team.name] )
                  {
                     backgroundColor = nflTeamColors[team.name];
                  }
               }
            }
            // These styles override MUI defaults. The backgroundColor is white by default,
            // but it changes to the team's color if they're picked to win (and white text).
            // Correct picks are colored green, incorrect picks are colored red.
            const styles = {
               borderRadius: "1em",
               justifyContent: justifyContentValue,
               fontSize: "0.7em",
               backgroundColor: backgroundColor
            };

            // Invalid team, return empty disabled button
            if ( !team )
            {
               return <ToggleButton
                  className="playoff-bracket-team"
                  style={styles}
                  value={-1}
                  disabled
                  key={index}
               />
            }

            // Team is valid, return clickable button with team details
            return <ToggleButton
               className="playoff-bracket-team"
               style={styles}
               value={index + 1}
               key={index}
            >
               <div className="image-container">
                  <img src={"/images/teams/" + team.name + "-logo.png"} alt={ team.name + " Logo" } />
               </div>
               <h3>{ team.seed }</h3>
               {/* White text for winner and black text for unpicked teams */}
               <h2 style={{color: ( winner === ( index + 1 ) ) ? "white" : "black"}}>{ team.name }</h2>
            </ToggleButton>
         })}
      </ToggleButtonGroup>
   )
}

export default Picks;
