Package.describe({
	name: 'steinitz:react-es6-component',
	version: '0.1.1',
	// Brief, one-line summary of the package.
	summary: 'Allow the use of getMeteorData in ES6 React classes similar to React.createClass class',
	// URL to the Git repository containing the source code for this package.
	git: '',
	// By default, Meteor will default to using README.md for documentation.
	documentation: 'README.md'
});

Package.onUse(function(api) {
	api.versionsFrom('1.2.1');
	api.use(['ecmascript', 'react@0.14.1_1', 'tracker', 'steinitz:react-es6-autobind@0.1.0']);
	api.addFiles('react-es6-component.js');
	api.export('SteinitzReactES6Component', ['client', 'server']);

});

Package.onTest(function(api) {
	api.use('ecmascript');
	api.use('tinytest');
	api.use('steinitz:react-es6-component');
	api.addFiles('react-es6-component-tests.js');
});
