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
			//setPlayer(prevPoints => [...player]); 
			//setPlayer = parsedData;
			return parsedData;
	   }
	   return "";
	}
	const [newPoint, setNewPoint] = useState('');
	//const [points, setPoints] = useState([]);
	const [player, setPlayer] = useState(LoadUsers());
	//const [player, setPlayer] = useState([{player: 'Trent', points: []}, {player: 'Tre', points: []}]);

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

	const handleKeyDown = (event, person, arrayIndex) => 
	{
		// If the enter being used, use the same as the button right next to it.
		if (event.key === 'Enter') 
		{
			event.preventDefault();
			addPoints( person, arrayIndex);
		}
	};

	const updateName = (person2, oldName) =>
	{
		let newName = prompt( "Enter a name:", oldName );
		if ( !newName )
		{
			// User cancelled, return with no error
			return;
		}

		const newData = person2.map(item => 
		{
			if (item.player === oldName) 
			{
				item.player = newName;
				const newValues = [...item.player];
				newValues.player = newName;
				return { ...item, player: newName };
			}
			return item;
		});
		// Reprint the updated name.
		setPlayer(prevItems => 
		{
			const newItems = [...prevItems]; // Create a shallow copy of the array
			return newItems; // Return the new array to update the state
		});
	}

	const listItems = player.map((person, arrayIndex) => 
		<div>
			<h3 onClick={() => {updateName(player, person.player)}}>{person.player}</h3>      
			<input
				type="text"
				min="0" max="999"
				size="4"
				value={newPoint}
				onKeyDown={(e) => { handleKeyDown(e, person, arrayIndex) }}
				onChange={(e) => setNewPoint(e.target.value)}
			/>
			<button 
				onClick={ ( ) => { addPoints( person, arrayIndex) }} >
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
	
	const addPoints = (person, arrayIndex) => 
	{
		if (newPoint !== null) 
		{
			const newPoints = parseInt(newPoint, 10);
			if (!isNaN(newPoints)) 
			{
				setPlayer(prevNewScore => {
					const newScore = [...prevNewScore];

					newScore[arrayIndex] = {...newScore[arrayIndex], points: [...newScore[arrayIndex].points, newPoints]};
//console.log("New ones " + JSON.stringify(newScore));
					return newScore;
				});

				setNewPoint('');
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
	  setPlayer(prevPoints => [...player, { player: newName, points: [] } ]); 
//console.log("2 " + JSON.stringify([...player, { player: newName, points: [] } ]));   
	  SaveUsers([...player, { player: newName, points: [] } ]);
   }

	const clearPoints = () =>
	{
		if (window.confirm("Are you sure you want to clear the points?")) 
		{
			const updatedPlayers = player.map(item => 
			{
				return { ...item, points: [] };
			});
			setPlayer(updatedPlayers);
		}	
	}
	
	const handleAction = () => 
	{
		if (window.confirm("Are you sure you want to reset?")) 
		{
			setPlayer([]);
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
