# simple-angular-autocomplete

This is a very simple autocomplete directive for angular. It only works with local data, string searching, the source as a list of objects, and it uses a google-like CSS format.

It's also very fast on account of being so simple.

`$scope.$broadcast('simple-autocomplete:clearInput');` to clear the input

### Future improvements:
- use ng-model on the directive, so using onSelect isn't required
- include an easy way to specify the width of the dropdown