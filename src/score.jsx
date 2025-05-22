import { useState, useEffect } from "react";

import "./score.css";

function Score( )
{
	const [newPoint, setNewPoint] = useState('');
	const [players, setPlayers] = useState([{player: 'Trent', points: []}, {player: 'Tre', points: []}]);

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

	const updateName = (person2, oldName) =>
	{
		let newName = prompt( "Enter a name:", oldName );
		if ( !newName )
		{
			// User cancelled, return with no error
			return;
		}

		setPlayers(person2.map(item => 
		{
			if (item.player === oldName) 
			{
				item.player = newName;
				const newValues = [...item.player];
				newValues.player = newName;
				return { ...item, player: newName };
			}
			return item;
		}));
	}

	const listItems = players.map((person, playerIndex) => 
		<div key={playerIndex}>
			<h3 onClick={() => {updateName(players, person.player)}}>{person.player}</h3>      
			<input
				type="text"
				min="0" max="999"
				size="4"
				value={newPoint}
				onKeyDown={(e) => { handleKeyDown(e, person, playerIndex) }}
				onChange={(e) => setNewPoint(e.target.value)}
			/>
			<button 
				onClick={ ( ) => { addPoints(playerIndex); setNewPoint(''); }} >
				Add 
			</button>
			<button 
				/* When "Undo" is clicked, subtract the amount that was previously added. */
				onClick={() =>
				{
					setPlayers(prevPlayer =>
					{
						if (prevPlayer[playerIndex].points)
						{
							prevPlayer[playerIndex].points.pop();
						}
						return prevPlayer;
					});
				}} >
				Undo
			</button>
			<NumberList numbers={person.points} />
			<ul>
				{person.points.map((line) => ( 
				<li>{line}</li>
				))}
			</ul>
		</div>
	);
	
	//console.log('player ' + JSON.stringify(player));
	//const [number, setNumber] = useState(0);
	
	const addPoints = (playerIndex) => 
	{
		if (newPoint !== null) 
		{
			const newPoints = parseInt(newPoint, 10);
			if (!isNaN(newPoints)) 
			{
				setPlayers(prevNewScore => {
					const newScore = [...prevNewScore];

					newScore[playerIndex] = {...newScore[playerIndex], points: [...newScore[playerIndex].points, newPoints]};
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

	  setPlayers([...players, { player: newName, points: [] }]);
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
