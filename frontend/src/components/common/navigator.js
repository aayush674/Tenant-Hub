import { useNavigate } from "react-router-dom";

function Navigator({path}){

    const navigate = useNavigate();

    return (
      <div>
        {path.map(({name, loc}, i) => (
          <span>
            {loc ? <span onClick={() => navigate(`${loc}`)} className="navigator">
              {name}
            </span> :
            <span>{name}</span>}
            {i <path.length - 1 && <span className="seperator"> / </span>}
          </span>
        ))}
      </div>
    );
}

export default Navigator;
