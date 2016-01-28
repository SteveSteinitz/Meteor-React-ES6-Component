React.MeteorComponent = class ReactMeteorComponent extends React.Component
{
	// SJS extra stuff
	getMeteorData () 	// dummy to prevent errors if not re-defined in subclass
	{
		return {};
	};

	constructor (props)
	{
	    super (props);
    	SteinitzREA.AutoBind (this);
	}

	componentWillMount ()	// some documents say this stuff should go in the constructor for this ES6 technique
	{
		this.data = {};
		this._meteorDataManager = new MeteorDataManager (this);
		var newData = this._meteorDataManager.calculateData ();
		this._meteorDataManager.updateData (newData);
	}

	componentWillUpdate (nextProps, nextState)
	{
		var saveProps = this.props;
		var saveState = this.state;
		var newData = undefined;
		try
		{
		 // Temporarily assign this.state and this.props, so that they are seen by getMeteorData.
		 // This is a simulation of how the proposed Observe API for React will work, which calls
		 // observe() after componentWillUpdate and after props and state are updated, but before
		 // render() is called. See https://github.com/facebook/react/issues/3398.
			this.props = nextProps;
			this.state = nextState;
			newData = this._meteorDataManager.calculateData ();
		}
		finally
		{
			this.props = saveProps;
			this.state = saveState;
		}
		this._meteorDataManager.updateData(newData);
	}

	componentWillUnmount ()
	{
		this._meteorDataManager.dispose ();
	}
};

// A class to keep the state and utility methods needed to manage the Meteor data for a component.

var MeteorDataManager =
function (component)
{
	babelHelpers.classCallCheck (this, MeteorDataManager); // SJS - what does this do?
	this.component      = component;
	this.computation    = null;
	this.oldData        = null;

	this.dispose =
	function dispose()
	{
		if (this.computation)
		{
			this.computation.stop();
			this.computation = null;
		}
	};

	this.calculateData =
	function calculateData()
	{
		var component	= this.component;
		var props 		= component.props;
		var state 		= component.state;
		if (!component.getMeteorData)
		{
			return null;
		}
	 // When rendering on the server, we don't want to use the Tracker. We only
	 // do the first rendering on the server so we can get the data right away
		if (Meteor.isServer)
		{
			return component.getMeteorData ();
		}
		if (this.computation)
		{
			this.computation.stop();
			this.computation = null;
		}
		var data = undefined;
	 // Use Tracker.nonreactive in case we are inside a Tracker Computation.
	 // This can happen if someone calls `ReactDOM.render` inside a Computation.
	 // In that case, we want to opt out of the normal behavior of nested
	 // Computations, where if the outer one is invalidated or stopped,
	 // it stops the inner one.
		this.computation = Tracker.nonreactive (
			function ()
			{
				return Tracker.autorun (
					function (computation)
					{
						if (computation.firstRun)
						{
							var savedSetState = component.setState;
							try
							{
								component.setState = function ()
								{
									throw new Error ("Can't call `setState` inside `getMeteorData` as this could cause an endless" + " loop. To respond to Meteor data changing, consider making this component" + " a \"wrapper component\" that only fetches data and passes it in as props to" + " a child component. Then you can use `componentWillReceiveProps` in that" + " child component.");
								};
								data = component.getMeteorData ();
							}
							finally
							{
								component.setState = savedSetState;
							}
						}
						else
						{
						 // Stop this computation instead of using the re-run. We use a brand-new
						 // autorun for each call to getMeteorData to capture dependencies on any
						 // reactive data sources that are accessed. The reason we can't use a single
						 // autorun for the lifetime of the component is that Tracker only re-runs
						 // autoruns at flush time, while we need to be able to re-call getMeteorData
						 // synchronously whenever we want, e.g. from componentWillUpdate.
							computation.stop();
						 // Calling forceUpdate() triggers componentWillUpdate which
						 // recalculates getMeteorData() and re-renders the component.
							// console.log ("MeteorDataManager.calculateData - calling component.forceUpdate");
							component.forceUpdate ();
						}
					}
				);
			}
		);

		if (Package.mongo && Package.mongo.Mongo)
		{
			Object.keys (data).forEach (
				function (key)
				{
					if (data [key] instanceof Package.mongo.Mongo.Cursor)
					{
						console.warn ("Warning: you are returning a Mongo cursor from getMeteorData. This value " + "will not be reactive. You probably want to call `.fetch()` on the cursor " + "before returning it.");
					}
				}
			);
		}
		return data;
	};

	this.updateData =
	function updateData (newData)
	{
		var component 	= this.component;
		var oldData 	= this.oldData;
		if (!(newData && typeof newData === 'object'))
		{
			throw new Error ("Expected object returned from getMeteorData");
		}
		// update componentData in place based on newData
		for (var key in babelHelpers.sanitizeForInObject (newData))
		{
			component.data [key] = newData [key];
		}
	 // if there is oldData (which is every time this method is called except the first),
	 // delete keys in newData that aren't in oldData. Don't interfere with other keys, in
	 // case we are co-existing with something else that writes to a component's this.data.
		if (oldData)
		{
			for (var key in babelHelpers.sanitizeForInObject (oldData))
			{
				if (!(key in newData))
				{
					delete component.data [key];
				}
			}
		}
		this.oldData = newData;
	};
};
