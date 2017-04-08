'use strict';

angular.module('simple-autocomplete', [])
	.directive('autocomplete', ['autocomplete-keys', '$window', '$timeout', function(Keys, $window, $timeout) {
		var template = 
		'<input type="text" class="autocomplete-input" placeholder="{{placeHolder}}"' +
			'ng-class="inputClass"' +
			'ng-model="searchTerm"' +
			'ng-keydown="keyDown($event)"' +
			'ng-keypress="keyPress($event)"' +
			'ng-blur="onBlur()"' +
            'ng-readonly="ngReadonly" />' +

		'<div class="autocomplete-options-container">' +
			'<div class="autocomplete-options-dropdown" ng-if="showOptions">' +
				'<div class="autocomplete-option" ng-if="!hasMatches">' +
					'<span>No matches</span>' +
				'</div>' +

				'<ul class="autocomplete-options-list">' +
					'<li class="autocomplete-option" ng-class="{selected: isOptionSelected(option)}" ' +
						'ng-style="{width: optionWidth}"' +
						'ng-repeat="option in matchingOptions"' +
						'ng-mouseenter="onOptionHover(option)"' +
						'ng-mousedown="selectOption(option)"' +
						'ng-if="!noMatches">' +
						'<span>{{option[displayProperty]}}</span>' +
					'</li>' +
				'</ul>' +
			'</div>' +
		'</div>';

		return {
			template: template,
			restrict: 'E',
			scope: {
				searchTerm: '=?ngModel',
				options: '=',
				onSelect: '=',
				ngReadonly: '=',
				displayProperty: '@',
				inputClass: '@',
				clearInput: '@',
				placeHolder: '@'
			},
			controller: function ($scope) {
				$scope.highlightedOption = null;
				$scope.showOptions = false;
				$scope.matchingOptions = [];
				$scope.hasMatches = false;
				$scope.selectedOption = null;

				$scope.isOptionSelected = function(option) {
					return option === $scope.highlightedOption;
				};

				$scope.processSearchTerm = function(term) {
					// console.log('ch-ch-ch-changin');
					if (term.length > 0) {
						if ($scope.selectedOption) {
							if (term != $scope.selectedOption[$scope.displayProperty]) {
								$scope.selectedOption = null;
							} else {
								$scope.closeAndClear();
								return;
							}
						}

						var matchingOptions = $scope.findMatchingOptions(term);
						$scope.matchingOptions = matchingOptions;
						if (!$scope.matchingOptions.indexOf($scope.highlightedOption) != -1) {
							$scope.clearHighlight();
						}
						$scope.hasMatches = matchingOptions.length > 0;
						$scope.showOptions = true;
					    $scope.setOptionWidth();
					} else {
						$scope.closeAndClear();
					}
				};

				$scope.findMatchingOptions = function(term) {
					if (!$scope.options) {
						throw 'You must define a list of options for the autocomplete ' +
						'or it took too long to load';
					}
					return $scope.options.filter(function(option) {
						var searchProperty = option[$scope.displayProperty];
						if (searchProperty) {
							var lowerCaseOption = searchProperty.toLowerCase();
							var lowerCaseTerm = term.toLowerCase();
							return lowerCaseOption.indexOf(lowerCaseTerm) != -1;
						}
						return false;
					});
				};

				$scope.findExactMatchingOptions = function(term) {
					return $scope.options.filter(function(option) {
						var lowerCaseOption = option[$scope.displayProperty].toLowerCase();
						var lowerCaseTerm = term ? term.toLowerCase() : '';
						return lowerCaseOption == lowerCaseTerm;
					});
				};

				$scope.keyDown = function(e) {
					switch(e.which) {
						case Keys.upArrow:
							e.preventDefault();
							if ($scope.showOptions) {
								$scope.highlightPrevious();
							}
							break;
						case Keys.downArrow:
							e.preventDefault();
							if ($scope.showOptions) {
								$scope.highlightNext();
							} else {
								$scope.showOptions = true;
								if ($scope.selectedOption) {
									$scope.highlightedOption = $scope.selectedOption;
								}
							}
							break;
					    case Keys.enter:
					        e.preventDefault();
					    case Keys.tab:
					        if ($scope.highlightedOption) {
							    $scope.selectOption($scope.highlightedOption);
                            } else {
								var exactMatches = $scope.findExactMatchingOptions($scope.searchTerm);
								if (exactMatches[0]) {
								    $scope.selectOption(exactMatches[0]);
                                }
							}
							break;
						case Keys.escape:
							$scope.closeAndClear();
							break;
					}
				};

				$scope.keyPress = function(e) {
					switch(e.which) {
						case Keys.upArrow:
						case Keys.downArrow:
					    case Keys.enter:
						case Keys.escape:
							break;
					    default:
					        $timeout(function() { $scope.processSearchTerm($scope.searchTerm); });
                            break;
					}
				};

			    //$scope.$watch('searchTerm', function(term, oldTerm) {
			    //    if (term && term !== oldTerm) {
			    //        $scope.processSearchTerm(term);
			    //    }
			    //});

				$scope.highlightNext = function() {
					if (!$scope.highlightedOption) {
						$scope.highlightedOption = $scope.matchingOptions[0];
					} else {
						var currentIndex = $scope.getCurrentOptionIndex();
						var nextIndex = currentIndex + 1 == $scope.matchingOptions.length 
							? 0 : currentIndex + 1;
						$scope.highlightedOption = $scope.matchingOptions[nextIndex];
					}
				};

				$scope.highlightPrevious = function() {
					if (!$scope.highlightedOption) {
						$scope.highlightedOption = $scope.matchingOptions[$scope.matchingOptions.length - 1];
					} else {
						var currentIndex = $scope.getCurrentOptionIndex();
						var previousIndex = currentIndex == 0 
							? $scope.matchingOptions.length - 1 
							: currentIndex - 1;
						$scope.highlightedOption = $scope.matchingOptions[previousIndex];
					}
				};

				$scope.onOptionHover = function(option) {
					$scope.highlightedOption = option;
				};

				$scope.$on('simple-autocomplete:clearInput', function() {
					$scope.searchTerm = '';
				});

				$scope.clearHighlight = function() {
					$scope.highlightedOption = null;
				};

				$scope.closeAndClear = function() {
					$scope.showOptions = false;
					$scope.clearHighlight();
				};

				$scope.selectOption = function(option) {
					// console.log('selected the option');
					$scope.selectedOption = option;
					$scope.onSelect(option);

					if ($scope.clearInput != 'False' && $scope.clearInput != 'false') {
						$scope.searchTerm = '';
					} else {
						$scope.searchTerm = option[$scope.displayProperty];
					}

					$scope.closeAndClear();
				};

				$scope.onBlur = function() {
					$scope.closeAndClear();
				};

				$scope.getCurrentOptionIndex = function() {
					return $scope.matchingOptions.indexOf($scope.highlightedOption);
				};
			},
			link: function(scope, elem, attrs) {
				scope.optionWidth = '400px';
				var inputElement = elem.children('.autocomplete-input')[0];

				scope.setOptionWidth = function() {
					// console.log(inputElement.offsetWidth);
					$timeout(function() {
						var pixelWidth = inputElement.offsetWidth > 400 ? 400 : inputElement.offsetWidth - 2;
						scope.optionWidth = pixelWidth + 'px';
					});
				};

				angular.element(document).ready(function() {
					scope.setOptionWidth();
				});

				angular.element($window).bind('resize', function() {
	                scope.setOptionWidth();
	            });
			}
		};
	}])

	.factory('autocomplete-keys', function() {
		return {
			upArrow: 38,
			downArrow: 40,
			enter: 13,
			escape: 27,
            tab: 9
		};
	});