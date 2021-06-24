import React from   'react';
import './App.css';
import { Link } from 'react-router-dom'


function Nav() {

    const navStyle = {
        color: 'white'
    };

    return(
        <nav>
            <Link style={navStyle} to='/'>
                <h3>KITTY ITEMS</h3>
            </Link>
            <ul className="nav-links">
                <Link style={navStyle} to='SendTransaction'>
                    <li>Mint NFT</li>
                </Link>
                <Link style={navStyle} to='SetupAccount'>
                    <li>Setup Account</li>
                </Link>
                <Link style={navStyle} to='/Authenticate'>
                    <li>SignIn/SignUp</li>
                </Link>
            </ul>
        </nav>
    );
}

export default Nav;