import { useState, useEffect } from "react";

import "./score.css";

function Score( )
{
   function LoadUsers()
   {
      let scoreUsers = localStorage.getItem( 'ScoreUsers' );
   //console.log("Find " + JSON.stringify(scoreUsers));   
      if ( scoreUsers )
      {
         const parsedData = JSON.parse(scoreUsers);
         console.log("LoadUsers " + JSON.stringify(parsedData));
         return parsedData;
      }
      
      // If the user doesn't have users defined in local storage, use default names
      return [{player: 'Trent', points: []}, {player: 'Tre', points: []}];
   }
   const [newPoints, setNewPoints] = useState([]);
   const [players, setPlayers] = useState(LoadUsers());

   function SaveUsers( users )
   {
      console.log("SaveUsers " + JSON.stringify(users));   
      localStorage.setItem('ScoreUsers', JSON.stringify(users));
      console.log("SaveUsers2 " + JSON.stringify(localStorage.getItem('ScoreUsers')));
   }

   useEffect(() => 
   {
      // Allow refreshing or able to disable all the values.
      window.addEventListener("beforeunload", alertUser);
      return () => 
      {
         window.removeEventListener("beforeunload", alertUser);
      };
   }, []);
   const alertUser = (e) =>
   {
      e.preventDefault();
      e.returnValue = "";
   };

   function NumberList({ numbers }) 
   {
      const sum = numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      return(<p>Total: {sum}</p>);
   }

   const handleKeyDown = (event, playerIndex) => 
   {
      // If the enter being used, use the same as the button right next to it.
      if (event.key === 'Enter') 
      {
         event.preventDefault();
         addPoints(playerIndex);
      }
   };

   const updateName = (oldName) =>
   {
      let newName = prompt( "Enter a name:", oldName );
      if ( !newName )
      {
         // User cancelled, return with no error
         return;
      }

      setPlayers(prevPlayers => prevPlayers.map(item =>
      {
         if (item.player === oldName) 
         {
            item.player = newName;
         }
         return item;
      }));
   }

   useEffect(() =>
   {
      SaveUsers(players);
      setNewPoints(players.map(_ => ''));
   }, [players]);

   const listItems = players.map((person, playerIndex) => 
      <div key={playerIndex}>
         <h3 onClick={() => {updateName(person.player)}}>{person.player}</h3>      
         <input
            type="text"
            min="0" max="999"
            size="4"
            value={newPoints[playerIndex]}
            onKeyDown={(e) => { handleKeyDown(e, playerIndex) }}
            onChange={(e) => { setNewPoints(prevNewPoints => prevNewPoints.map((point, index) =>
            {
               if (index === playerIndex)
               {
                  point = e.target.value;
               }
               return point;
            }))}}
         />
         <button 
            onClick={(e) =>
            {
               addPoints(playerIndex);
               setNewPoints(prevNewPoints => prevNewPoints.map((point, index) =>
               {
                  if (index === playerIndex)
                  {
                     point = e.target.value;
                  }
                  return point;
               }))
            }}
         >
            Add 
         </button>
         <NumberList numbers={person.points} />
         <ul>
            {person.points.map((line) => ( 
            <li>{line}</li>
            ))}
         </ul>
      </div>
   );
   
   const addPoints = (playerIndex) => 
   {
      if (newPoints[playerIndex]) 
      {
         const newPointsNum = parseInt(newPoints[playerIndex], 10);
         if (!isNaN(newPointsNum)) 
         {
            setPlayers(prevPlayers => {
               const newScore = [...prevPlayers];

               newScore[playerIndex] = {...newScore[playerIndex], points: [...newScore[playerIndex].points, newPointsNum]};
//console.log("New ones " + JSON.stringify(newScore));
               return newScore;
            });
         } else {
            alert('Invalid input. Please enter an integer.');
         }
      }
   };

   function handleSubmit(e) 
   {
      // Prevent the browser from reloading the page
      e.preventDefault();
   }
  
   const addName = (  ) =>
   {
      let newName = prompt( "Enter a name:" );
      if ( !newName )
      {
         // User cancelled, return with no error
         return;
      }

   //console.log("1 " + JSON.stringify(player));
      setPlayers(prevPlayers =>
      {
         SaveUsers([...prevPlayers, { player: newName, points: [] } ]);
         return [...prevPlayers, { player: newName, points: [] } ];
      });
   //console.log("2 " + JSON.stringify([...player, { player: newName, points: [] } ]));
   }

   const clearPoints = () =>
   {
      if (window.confirm("Are you sure you want to clear the points?")) 
      {
         setPlayers(prevPlayers => prevPlayers.map(item => {return { ...item, points: [] }}));
      }   
   }
   
   const handleAction = () => 
   {
      if (window.confirm("Are you sure you want to reset?"))
      {
         setPlayers([]);
      }
   };

   return (
      <form method="post" onSubmit={handleSubmit} id="keep-score-entry">
        <h2>Keep Score</h2>
      <div>
         <button onClick={ ( ) => { addName( ); }}>
            Add User...
         </button>
         <button onClick={clearPoints} >
            Clear Points...
         </button>
         <button onClick={handleAction} >
            Reset...
         </button>
      </div>      
      <section id="names">
         {listItems}
      </section>

       </form>
    );
}

export default Score;
