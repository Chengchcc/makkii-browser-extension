import * as React from 'react';
import * as ReactDOM from 'react-dom';


const App = ()=>{
    return (
      <div>
        hello world
      </div>
    )
}

chrome.storage.local.get("state", (obj)=>{
  const {state}= obj;
  ReactDOM.render(<App/>, document.querySelector("#root"))
})