Tinytest.add (
	'getMeteorDataTest',
	function (test)
	{
		if (Meteor.server)
		{}
		MyReactTestComponent = class MyReactTestComponent extends React.MeteorComponent
		{
			getMeteorData ()
			{
				var result = {};
				result.test = "meteor data";
				return result;
			}

			meteorDataTest ()
			{
				return this.data.test;
			}
		};

		var instance 				= new MyReactTestComponent({});

	 // simulate React mounting a component
		instance.componentWillMount 	();
		instance.componentWillUpdate 	({}, {});

		var meteorDataTestExpected	= 'meteor data';
		var meteorDataTestActual	= instance.meteorDataTest ();
		test.equal (meteorDataTestExpected, meteorDataTestActual);
	}
);
