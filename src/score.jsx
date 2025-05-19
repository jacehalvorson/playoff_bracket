import { useState, useEffect } from "react";

import "./score.css";

function Score( )
{
	const [newPoint, setNewPoint] = useState('');
	//const [points, setPoints] = useState([]);
	const [player, setPlayer] = useState([{player: 'Trent', points: []}, {player: 'Tre', points: []}]);

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

	const listItems = player.map((person, arrayIndex) => 
		<div>
			<h3>{person.player}</h3>      
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
	
	//console.log('player ' + JSON.stringify(player));
	//const [number, setNumber] = useState(0);
	
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

	  setPlayer(prevPoints => [...player, { player: newName, points: [] } ]); 
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
