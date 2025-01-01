import { useState, useEffect } from "react";
import { fetchAPI } from "./api_requests.js";
import submitWinners from "./submit_winners.js";
import { getOrCreateDeviceID } from "./playoff_bracket.jsx"
import { computeAllGames } from "./bracket_utils.js";

import "./admin.css";

const apiName = "apiplayoffbrackets";

const currentYear = 2025;

function Admin( )
{
    const [submitGame, setSubmitGame] = useState( "" );
    const [scores, setScores] = useState( "0000000000000" );
    const [scoresStatus, setScoresStatus] = useState( "Loading brackets..." );

    // Get the device ID which is common for a single person.
    const deviceId = getOrCreateDeviceID();
    useEffect(() =>
    {
        fetchAPI( apiName, `/teams/${currentYear}` )
            .then(response =>
            {
                // Extract the winning bracket from the response
                const winningPicks = response.find(entry => entry.index === "winners").value;

                // Set scores variable to display list of entries
                setScores(winningPicks);
                setScoresStatus("");
            })
            .catch(err =>
            {
                setScoresStatus("Error fetching brackets from database");
                console.error(scoresStatus + " " + err);
            });
    });

    var spanColorA11 = "white";
    var spanColorA12 = "white";
    var spanColorA13 = "white";
    var spanColorA21 = "white";
    var spanColorA22 = "white";
    var spanColorA23 = "white";
    var spanColorN11 = "white";
    var spanColorN12 = "white";
    var spanColorN13 = "white";
    var spanColorN21 = "white";
    var spanColorN22 = "white";
    var spanColorN23 = "white";
    var spanColorA14 = "white";
    var spanColorA24 = "white";
    var spanColorA15 = "white";
    var spanColorA25 = "white";
    var spanColorN14 = "white";
    var spanColorN24 = "white";
    var spanColorN15 = "white";
    var spanColorN25 = "white";
    var spanColorA16 = "white";
    var spanColorA26 = "white";
    var spanColorN17 = "white";
    var spanColorN27 = "white";
    var AF1Second = "M";
    var AF1Third = "m";
    var AF1Last = "L";
    var NF1Second = "M";
    var NF1Third = "m";
    var NF1Last = "L";
    try {
        const allGames = computeAllGames(scores);
        if (allGames.afcWildcardGames[0].winner === 1) {
            spanColorA11 = "red";
        }
        if (allGames.afcWildcardGames[0].winner === 2) {
            spanColorA21 = "red";
        }
        if (allGames.afcWildcardGames[1].winner === 1) {
            spanColorA12 = "red";
        }
        if (allGames.afcWildcardGames[1].winner === 2) {
            spanColorA22 = "red";
        }
        if (allGames.afcWildcardGames[2].winner === 1) {
            spanColorA13 = "red";
        }
        if (allGames.afcWildcardGames[2].winner === 2) {
            spanColorA23 = "red";
        }
        if (allGames.nfcWildcardGames[0].winner === 1) {
            spanColorN11 = "red";
        }
        if (allGames.nfcWildcardGames[0].winner === 2) {
            spanColorN21 = "red";
        }
        if (allGames.nfcWildcardGames[1].winner === 1) {
            spanColorN12 = "red";
        }
        if (allGames.nfcWildcardGames[1].winner === 2) {
            spanColorN22 = "red";
        }
        if (allGames.nfcWildcardGames[2].winner === 1) {
            spanColorN13 = "red";
        }
        if (allGames.nfcWildcardGames[2].winner === 2) {
            spanColorN23 = "red";
        }
        if (allGames.afcDivisionalGames[0].winner === 1) {
            spanColorA14 = "red";
        }
        if (allGames.afcDivisionalGames[0].winner === 2) {
            spanColorA24 = "red";
        }
        if (allGames.afcDivisionalGames[1].winner === 1) {
            spanColorA15 = "red";
        }
        if (allGames.afcDivisionalGames[1].winner === 2) {
            spanColorA25 = "red";
        }
        if (allGames.afcDivisionalGames[0].awayTeam != null && allGames.afcDivisionalGames[1].awayTeam != null) {
            AF1Second = allGames.afcDivisionalGames[1].homeTeam.charAt(1);
            AF1Third = allGames.afcDivisionalGames[1].awayTeam.charAt(1);
            AF1Last = allGames.afcDivisionalGames[0].awayTeam.charAt(1);
        }
        if (allGames.nfcDivisionalGames[0].winner === 1) {
            spanColorN14 = "red";
        }
        if (allGames.nfcDivisionalGames[0].winner === 2) {
            spanColorN24 = "red";
        }
        if (allGames.nfcDivisionalGames[1].winner === 1) {
            spanColorN15 = "red";
        }
        if (allGames.nfcDivisionalGames[1].winner === 2) {
            spanColorN25 = "red";
        }
        if (allGames.nfcDivisionalGames[0].awayTeam != null && allGames.nfcDivisionalGames[1].awayTeam != null) {
            NF1Second = allGames.nfcDivisionalGames[1].homeTeam.charAt(1);
            NF1Third = allGames.nfcDivisionalGames[1].awayTeam.charAt(1);
            NF1Last = allGames.nfcDivisionalGames[0].awayTeam.charAt(1);
        }
        if (allGames.afcChampionshipGames && allGames.afcChampionshipGames[0].winner === 1) {
            spanColorA16 = "red";
        }
        if (allGames.afcChampionshipGames && allGames.afcChampionshipGames[0].winner === 2) {
            spanColorA26 = "red";
        }
        if (allGames.nfcChampionshipGames && allGames.nfcChampionshipGames[0].winner === 1) {
            spanColorN17 = "red";
        }
        if (allGames.nfcChampionshipGames && allGames.nfcChampionshipGames[0].winner === 2) {
            spanColorN27 = "red";
        }
    } catch (err) { console.error(err); }

    return (
        <main id="playoff-bracket-entry">
            <h2>{currentYear} Playoff Bracket</h2>
            <h2>Picks (NFL_BRACKET)</h2>
            <h4>---------AFC NFC AF NF A N S</h4>
            <div>Line 1 - <span id={spanColorA11}>2</span><span id={spanColorA12}>3</span><span id={spanColorA13}>4</span> <span id={spanColorN11}>2</span><span id={spanColorN12}>3</span><span id={spanColorN13}>4</span> <span id={spanColorA14}>1</span><span id={spanColorA15}>{AF1Second}</span> <span id={spanColorN14}>1</span><span id={spanColorN15}>{NF1Second}</span> <span id={spanColorA16}>H</span> <span id={spanColorN17}>H</span> A</div>
            <div>Line 2 - <span id={spanColorA21}>7</span><span id={spanColorA22}>6</span><span id={spanColorA23}>5</span> <span id={spanColorN21}>7</span><span id={spanColorN22}>6</span><span id={spanColorN23}>5</span> <span id={spanColorA24}>{AF1Last}</span><span id={spanColorA25}>{AF1Third}</span> <span id={spanColorN24}>{NF1Last}</span><span id={spanColorN25}>{NF1Third}</span> <span id={spanColorA26}>L</span> <span id={spanColorN27}>L</span> N</div>
            <input type="text" id="newPicks" defaultValue={scores} key={scores} />
            <button
                id="add-to-NFL-bracket"
                onClick={ ( ) => { submitWinners( setSubmitGame, deviceId ); }}
            >
                Update NFL Bracket
            </button>
            <h2><span id="red">{submitGame}</span></h2>
            <h4><span id="black">{deviceId}</span></h4>
        </main>
     );
}

export default Admin;
