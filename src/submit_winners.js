import { postAPI } from "./api_requests.js";

const apiName = "apiplayoffbrackets";

const currentYear = 2025;

export default async function submitWinners(setSubmitGame, deviceID)
{
    const devices = ["gp5menfyg", "80gagw0", "3jqsmufo9", "01941d8b-881f-72d9-bc04-5e92fed37bf1"];
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
        index: "winners",
        value: document.getElementById("newPicks").value // 1111111111112
    };

    if ( bracketData.value.length !== 13 )
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
