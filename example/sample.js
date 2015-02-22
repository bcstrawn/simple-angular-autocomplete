angular.module('sampleApp', ['simple-autocomplete']).controller('SampleCtrl', function($scope) {
	$scope.selectedData = null;
	$scope.datas = [
		{title: 'The dog', age: 2},
		{title: 'The cat', age: 4},
		{title: 'The bird', age: 7}
	];

	$scope.onSelect = function(selection) {
		console.log(selection);
		$scope.selectedData = selection;
	};

	$scope.clearInput = function() {
		$scope.$broadcast('simple-autocomplete:clearInput');
	};
})