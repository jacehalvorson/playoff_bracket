import { Link } from 'react-router-dom';
import './button.css'; // Import the CSS file

function ButtonLink( to, text ) 
{
  return (
    <Link to={to} className="custom-button">
      {text}
    </Link>
  );
}

export default ButtonLink;