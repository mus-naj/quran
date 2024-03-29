// describe your test suite
describe('AyatSearchController', function () {
    var $controller, $rootScope, $scope, $httpBackend, controller;

    function sumDictionaryValues(dictionary) {
        let sum = 0;
        for (let key in dictionary) {
            if (dictionary.hasOwnProperty(key)) {
                sum += dictionary[key];
            }
        }
        return sum;
    }

    // load the module that contains the controller
    beforeEach(angular.mock.module('myApp'));

    beforeEach(angular.mock.inject(function (_$controller_, _$rootScope_, _$http_, _$routeParams_, _$location_, _$timeout_, _$httpBackend_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $http = _$http_;
        $routeParams = _$routeParams_;
        $location = _$location_;
        $timeout = _$timeout_;
        $httpBackend = _$httpBackend_;

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

    it('Should search for "الله*" and find 978 times with kasra, and 978 with damma', function () {
        // Mock the HTTP request for the template
        $httpBackend.expectGET('view/search.html').respond(200, '');

        var initSearchStr = "الله*"
        $scope.searchQueryRegex = getRegexPatternForString(initSearchStr, $scope.searchConfig);

        // Trigger the digest cycle to ensure $watch has finished
        $rootScope.$digest();

        expect($scope.isSearchDone).toBe(true);

        expect($scope.resultsGroup.length).toBe(6);
        var allah_ends_with_kasrah = "اللَّهِ";
        expect($scope.resultsGroup[0]).toBe(allah_ends_with_kasrah);
        var allah_ends_with_dammah = "اللَّهُ";
        expect($scope.resultsGroup[1]).toBe(allah_ends_with_dammah);

        let count_allah_with_kasrah = $scope.countedAyahAttributes['matched'][allah_ends_with_kasrah] + 0;
        expect(count_allah_with_kasrah).toBe(978);

        let count_allah_with_dammah = $scope.countedAyahAttributes['matched'][allah_ends_with_dammah] + 0;
        expect(count_allah_with_dammah).toBe(978);
    });

    // number of letters with harakat in quran
    it('Should search for "_" and find 354 unique result, and 330709 in total', function () {
        // Mock the HTTP request for the template
        $httpBackend.expectGET('view/search.html').respond(200, '');

        var initSearchStr = "_"
        $scope.searchQueryRegex = getRegexPatternForString(initSearchStr, $scope.searchConfig);

        // Trigger the digest cycle to ensure $watch has finished
        $rootScope.$digest();

        expect($scope.isSearchDone).toBe(true);

        expect($scope.resultsGroup.length).toBe(354);

        let sum = sumDictionaryValues($scope.countedAyahAttributes['matched']);
        expect(sum).toBe(330709);
    });

    // number of words in quran
    it('Should search for "." and find 17619 unique result, and 77797 in total', function () {
        // Mock the HTTP request for the template
        $httpBackend.expectGET('view/search.html').respond(200, '');

        var initSearchStr = "."
        $scope.searchQueryRegex = getRegexPatternForString(initSearchStr, $scope.searchConfig);

        // Trigger the digest cycle to ensure $watch has finished
        $rootScope.$digest();

        expect($scope.isSearchDone).toBe(true);

        expect($scope.resultsGroup.length).toBe(17619);

        let sum = sumDictionaryValues($scope.countedAyahAttributes['matched']);
        expect(sum).toBe(77797);
    });

    // number of ayat in quran
    it('Should search for ".." and find 6057 unique result, and 6236 in total', function () {
        // Mock the HTTP request for the template
        $httpBackend.expectGET('view/search.html').respond(200, '');

        var initSearchStr = ".."
        $scope.searchConfig = {
            searchFromBeginning: true,
            searchOnEnd: true,
            excludePartOfWords: false
        };
        $scope.searchQueryRegex = getRegexPatternForString(initSearchStr, $scope.searchConfig);

        // Trigger the digest cycle to ensure $watch has finished
        $rootScope.$digest();

        expect($scope.isSearchDone).toBe(true);

        expect($scope.resultsGroup.length).toBe(6057);

        let sum = sumDictionaryValues($scope.countedAyahAttributes['matched']);
        expect(sum).toBe(6236);
    });
});