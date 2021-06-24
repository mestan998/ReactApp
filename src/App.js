import './App.css';
import styled from 'styled-components'
import Authenticate from './Authenticate'
import SendTransaction from './SendTransaction'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom'
import Nav from './Nav';
import SetupAccount from './SetupAccount';


const Wrapper = styled.div`
  font-size: 13px;
  font-family: Arial, Helvetica, sans-serif;
`;

function App() {
  return (
    <Router>
      <div className="App">
        <Wrapper>
          <Nav />
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/SetupAccount" component={SetupAccount} />
            <Route path="/Authenticate" component={Authenticate} />
            <Route path="/SendTransaction" component={SendTransaction} />
          </Switch>
        </Wrapper>
      </div>
    </Router>
  );
}

const Home = () => (
  <div>
    <h1>KITTY ITEM MARKET PLACE</h1>
  </div>
);

export default App