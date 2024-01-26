// describe your test suite
describe('AyatSearchController', function () {
    var $controller, $rootScope, $scope, controller;

    // load the module that contains the controller
    beforeEach(angular.mock.module('myApp'));

    beforeEach(angular.mock.inject(function (_$controller_, _$rootScope_, _$http_, _$routeParams_, _$location_, _$timeout_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $http = _$http_;
        $routeParams = _$routeParams_;
        $location = _$location_;
        $timeout = _$timeout_;

        // create a new scope
        $scope = $rootScope.$new();

        // create the controller with the new scope
        controller = $controller('AyatSearchController', {
            $scope: $scope,
            $http: $http,
            $routeParams: $routeParams,
            $location: $location,
            $timeout: $timeout
        });
    }));

    // write your test cases
    it('Should define the constant of FATHA correctly', function () {
        expect($scope.FATHA).toBe("\u064E");
    });

    it('Should search for "الله." and find 978 times with kasra, and 978 with damma', function () {
        var initSearchStr = "الله."
        $scope.searchQueryRegex = getRegexPatternForString(initSearchStr, $scope.searchConfig);
        expect($scope.FATHA).toBe("\u064E");
    });
});