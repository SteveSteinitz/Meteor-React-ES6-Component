# Add getMeteorData to ES6 React classes and make 'this' consistent

This package supports a getMeteorData method in ES6 React component classes just like when you create your components with React.createClass.  It also ensures that 'this' always refers to the component.

## Usage
In Meteor if you create a react component with React.createClass you can add a powerful, MDG-supported mixin, ReactMeteorData, which allows you to write a getMeteorData method which offers easy reactivity for database changes and subscription-loading completion.  

If instead, you create your react component with ES6 syntax:

    MyClass = class MyClass extends React.component
    
 you get no support for a getMeteorData method (nor for any mixins).  Further, with React.createClass most of your methods are automatically bound (as expected) such that 'this' is the component itself, as expected.  This package adds those two features to ES6 React Components.  Install the package, then extend your React component from React.MeteorComponent like so:

    MyClass = class MyClass extends React.MeteorComponent

Then you can write a getMeteorData method something like the following:

    getMeteorData ()
    {
        var transactionSubscription = Meteor.subscribe ('dtTransactions');
        var result                  = {};
        result.ready                = transactionsSubscription.ready();
        return result;
    };
    
then your component will react to this.data.ready and other database changes.  Moreover, in all of your methods, 'this' will automatically refer to the component, rather than, as is the less-useful default, the DOM window. 

You can find more information about getMeteorData in the [Meteor React Tutorial](https://www.meteor.com/tutorials/react/collections)

## Important Note
If you need to implement any of the three following React lifecycle methods:

    componentWillMount ()
    componentWillUnmount ()
    componentWillUpdate (nextProps, nextState)

then you'll need to call the inherited method.  For example, implement componentWillMount like so:

    componentWillMount ()
    {
        super.componentWillMount ();
        // do custom stuff
    }

or implement componentWillUpdate like so:

    componentWillUpdate (nextProps, nextState)
    {
        super.componentWillUpdate (nextProps, nextState);
        // do custom stuff
    }

Forgetting to do the above will result in difficult-to-diagnose bugs.  
Other React lifecycle methods are unaffected.