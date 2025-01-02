import { postAPI } from "./api_requests.js";

const apiName = "apiplayoffbrackets";

const currentYear = 2025;

export default async function submitWinners( setSubmitGame, deviceID, index )
{
    const devices = [
        "01941b07-2017-76b1-94fd-5e6f4b172f0a",
        "01941d8b-881f-72d9-bc04-5e92fed37bf1",
        "01941ad8-ebcc-7320-8033-fa1ad9260ca5", // Jace PC (main)
        "01941e6e-0c66-779e-ad3a-3bbb779c3c2a", // Jace phone (main)
        "019410c4-cfe9-74eb-83e1-7e5407d242c8" // Jace PC (local)
    ];

    let validDevice = false;

    setSubmitGame("Adding updated games...");
    
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
        return 0;
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
        return 0;
    }

    for ( let i = 0; i < bracketData.value.length; i++ )
    {
        const currentSubstring = bracketData.value.slice(i, i + 1);
        if ( currentSubstring !== "0" && currentSubstring !== "1" && currentSubstring !== "2" )
        {
            alert("You are just putting the wrong items in this setup for no actual reason.");
            setSubmitGame("Wrong Words.");
            return 0;
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
