import { useState, useEffect } from "react";

import { computeAllGames, getSuffix, emptyGames, nflTeamColors } from "./bracket_utils.js"
import { submitBracket, deleteBracket, changeDisplayName } from "./submit_bracket.js";

import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';

import "./picks.css";

function Picks( props )
{
   const [games, setGames] = useState( emptyGames );
   const [submitStatus, setSubmitStatus] = useState( "" );

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
         ( currentBracket && currentBracket.devices && currentBracket.devices.includes( deviceID ) && currentBracket.name )
            ? <Button
               variant="text"
               onClick={ ( ) => changeDisplayName( setSubmitStatus, currentYear, group, currentBracket.name, setReloadBrackets, switchFocus ) }
            >
               Change Display Name
            </Button>
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
               />
            </div>
            <div className="playoff-bracket-nfc">
               <h2>NFC Championship</h2>
               <PlayoffBracketGame
                  game={games.nfcChampionshipGame}
                  pickIndex={11}
                  updatePick={updatePick}
                  playoffTeams={playoffTeams}
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
                              else
                              {
                                 // This button is a Submit/Save button, submit/save the bracket
                                 submitBracket( setSubmitStatus, deviceID, picks, tiebreaker, setReloadBrackets, currentYear, group, switchFocus, currentBracket );
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
            // These styles override MUI defaults. The backgroundColor is white by default,
            // but it changes to the team's color if they're picked to win (and white text).
            const styles = {
               borderRadius: "1em",
               justifyContent: justifyContentValue,
               fontSize: "0.7em",
               backgroundColor: ( ( winner === ( index + 1 ) ) && team && team.name && nflTeamColors[team.name] )
                  ? nflTeamColors[team.name]
                  : "white",
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
