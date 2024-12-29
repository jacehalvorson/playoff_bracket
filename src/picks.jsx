import { useState, useEffect } from "react";

import { computeAllGames, emptyGames, nflTeamColors } from "./bracket_utils.js"
import submitBracket from "./submit_bracket.js";

import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';

import "./picks.css";


function Picks( props )
{
   const [games, setGames] = useState( emptyGames );
   const [tiebreaker, setTiebreaker] = useState( "" );
   const [submitStatus, setSubmitStatus] = useState( "" );

   const currentYear = props.currentYear
   const deviceID = props.deviceID;
   const picks = props.picks;
   const setPicks = props.setPicks;
   const setNewBracketSubmitted = props.setNewBracketSubmitted;
   const playoffTeams = props.playoffTeams;
   const group = props.group;
   const switchFocus = props.switchFocus;
   const currentBracket = props.currentBracket;
   const gamesStarted = props.gamesStarted;

   // Used by buttons to select teams. Error checks the new value and updates picks
   const updatePick = ( index, value ) =>
   {
      if ( isNaN( Number( index ) ) || Number( index ) < 0 || Number( index ) > 12 ||
           isNaN( Number( value ) ) || Number( value ) < 0 || Number( value ) > 2 )
      {
         console.error( "Cannot update pick " + index + " with value " + value );
         return;
      }

      // Take the existing picks before and after the index, but replace to value at the index
      // e.g., "1121" + "2" + "00000000"
      let newPicks = picks.substring( 0, index ) +
                     value.toString( ) +
                     picks.substring( index + 1 );
      setPicks( newPicks );
   }

   // Update all the Wild Card games when the playoff teams or picks change
   useEffect( ( ) => {
      setGames( computeAllGames( picks ) );

      // Reset the submit status when the picks change
      setSubmitStatus( "" );
   }, [ picks ] );

   return (
      <div id="playoff-bracket-picks">
         <h2>
         {
            ( currentBracket && currentBracket.name )
               ? ( gamesStarted )
                  ? "Viewing bracket \"" + currentBracket.name + ( ( currentBracket.bracketIndex > 0 ) ? ` (${currentBracket.bracketIndex + 1})` : "" ) + "\""
                  : "Editing bracket \"" + currentBracket.name + ( ( currentBracket.bracketIndex > 0 ) ? ` (${currentBracket.bracketIndex + 1})` : "" ) + "\""
               : "Create New Bracket"
         }
         </h2>
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
                     inputMode="numeric"
                     style={{ marginTop: "1em" }}
                     onChange={( event ) => {
                        setTiebreaker( event.target.value );
                     }}
                  />

                  {/* If the input isn't valid don't allow submision */}
                  {( !picks || !/[1-2]{13}$/.test( picks ) ||
                     !tiebreaker || isNaN( parseInt( tiebreaker ) ) || tiebreaker < 0 )

                        // Picks are not filled out, disable submission
                        ? <Button
                           id="submit-picks-button"
                           variant="outlined"
                           size="large"
                        >
                        {
                           ( currentBracket && currentBracket.name )
                              ? "Save"
                              : "Submit"
                        }
                        </Button>

                        // Picks are filled out, allow submission
                        : <Button
                           id="submit-picks-button"
                           variant="contained"
                           size="large"
                           onClick={ ( ) =>
                           {
                              submitBracket( setSubmitStatus, deviceID, picks, tiebreaker, setNewBracketSubmitted, currentYear, group, switchFocus );
                           }}
                        >
                           ( currentBracket && currentBracket.name )
                              ? "Save"
                              : "Submit"
                        </Button>
                  }
               </div>
               
               <h2 id="submit-status" style={{margin: "0.5em", width: "90vw", textAlign: "center"}}>{submitStatus}</h2>
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
