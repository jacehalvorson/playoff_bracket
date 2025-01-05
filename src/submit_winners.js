import { postAPI } from "./api_requests.js";

const apiName = "apiplayoffbrackets";

const currentYear = 2025;

const devices = [
    "019437bf-9e00-707a-a9ed-b6f3bf1ed7a3", // Trent phone (main)
    "01941d8b-881f-72d9-bc04-5e92fed37bf1", // Trent PC (local)
    "01943808-e6bc-74bf-a0dd-1191a3c9f0dc", // Trent PC (main)
    "0194340f-8776-7146-8957-90a007de9c8e", // Jace PC (main)
    "01942411-a522-74d8-8eb4-78b80ab15851", // Jace phone (main)
    "019410c4-cfe9-74eb-83e1-7e5407d242c8" // Jace PC (local)
];


export async function submitWinners( setSubmitGame, deviceID, index )
{
    let validDevice = false;

    setSubmitGame( "Adding updated games..." );
    
    devices.forEach( device =>
    {
        if ( deviceID === device )
        {
            validDevice = true;
        }
    });

    if ( !validDevice )
    {
        alert("The Picks has been updated and you have been charged $50 from Venmo for this change.");
        setSubmitGame("Denied.");
        return;
    }

    let bracketData = {
        year: currentYear,
        index: index,
        value: ( index === "winners" )
                  ? document.getElementById("newPicks").value // 1111111111112
                  : document.getElementById("newGamesStarted").value // 0 or 1
    };

    if ( ( index === "winners" && bracketData.value.length !== 13 ) ||
         ( index === "gamesStarted" && bracketData.value !== "0" && bracketData.value !== "1" ) )
    {
        alert("Entering the wrong number of " + bracketData.value + ". Use 13 numbers instead of the used " + bracketData.value.length + " numbers.");
        setSubmitGame("Denied.");
        return;
    }

    for ( let i = 0; i < bracketData.value.length; i++ )
    {
        const currentSubstring = bracketData.value.slice(i, i + 1);
        if ( currentSubstring !== "0" && currentSubstring !== "1" && currentSubstring !== "2" )
        {
            alert("You are just putting the wrong items in this setup for no actual reason.");
            setSubmitGame("Wrong Words.");
            return;
        }
    };

    // Send POST request to database API with this data
    postAPI( apiName, `/teams`, bracketData )
    .then(response => {
        setSubmitGame("Success");
    })
    .catch(err => {
        console.error(err);
        setSubmitGame("Error adding bracket to database");
    });
}

export async function submitTeam( setSubmitGame, deviceID )
{
    let validDevice = false;

    setSubmitGame( `Updating team...` );
    
    devices.forEach( device =>
    {
        if ( deviceID === device )
        {
            validDevice = true;
        }
    });

    if ( !validDevice )
    {
        alert("The team has been updated and you have been charged $50 from Venmo for this change.");
        setSubmitGame("Denied.");
        return;
    }

    const teamIndex = document.getElementById("newTeamIndex").value;
    const teamName = document.getElementById("newTeamName").value;

    if ( !teamIndex || !/^[A-Z]{1}[1-7]{1}$/.test( teamIndex ) ||
         !teamName || !/^[A-Z0-9]{1}[a-z0-9]{1,}s{1}$/.test( teamName ) )
    {
        setSubmitGame( "Invalid team information" );
        return;
    }

    let teamData = {
        year: currentYear,
        index: teamIndex,
        value: teamName
    };

    // Send POST request to teams API with this data
    postAPI( apiName, `/teams`, teamData )
    .then( response =>
    {
        setSubmitGame( "Success" );
    })
    .catch( err =>
    {
        console.error( err );
        setSubmitGame( "Error updating team" );
    });
}
