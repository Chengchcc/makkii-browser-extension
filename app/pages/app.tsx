import * as React from "react";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";

// pages
import PageLogin from "./pageLogin";
import PageStatus from "./pageStatus";

const App = () => {
    return (
        <HashRouter>
            <Switch>
                <Route exact path="/login" component={PageLogin} />
                <Route path="/status" component={PageStatus} />
                <Redirect from="/" to="/status" />
            </Switch>
        </HashRouter>
    );
};

export default App;
