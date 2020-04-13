import * as React from "react";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";

// pages
import PageLogin from "./pageLogin";
import PageAccountList from "./pageAccountList";
import Layout from "../layout";

const App = () => {
    return (
        <Layout>
            <HashRouter>
                <Switch>
                    <Route exact path="/login" component={PageLogin} />
                    <Route path="/status" component={PageAccountList} />
                    <Redirect from="/" to="/status" />
                </Switch>
            </HashRouter>
        </Layout>
    );
};

export default App;
