var myApp = angular.module('myApp', ['ngSanitize','ngRoute']);

//constants
const FATHATAN = "\u064B"; // ً
const DAMMATAN = "\u064C"; // ٌ
const KASRATAN = "\u064D"; // ٍ
const FATHA = "\u064E"; // َ
const DAMMA = "\u064F"; // ُ
const KASRA = "\u0650"; // ِ
const SHADDA = "\u0651"; // ّ
const SUKUN = "\u0652"; // ْ

const not_space ='[^\\s]';
const alharakat_mufradah = FATHA + DAMMA + KASRA;
const alharakat_tanween = FATHATAN + DAMMATAN + KASRATAN;
const numbers='1234567890';
const arabic_numbers='١٢٣٤٥٦٧٨٩٠';
const alharakat_other = SHADDA + SUKUN;
const kul_alharakat = alharakat_mufradah + alharakat_tanween + alharakat_other + 'ٰ';
const huroof = 'ابتثجحخدذرزسشصطضظعغفقكلمنهوي';
const special_huroof = 'ةى';
const ahrof_alela = 'اويى';
const ahrof_hamzah = 'اأإآؤئءٰ';
const kul_huroof = ahrof_hamzah + huroof + special_huroof;
const huroof_wa_harakat = kul_huroof + kul_alharakat;

var regex_flags='gud';

try{
    new RegExp("",regex_flags);
}
catch(exp){
    regex_flags='gd';
}

function arabic_to_english_number(number){
    return numbers[arabic_numbers.search(number)];
}

//add space to beginning and end of ayat text
all_ayat.map(function(item){
    item["text"]=" "+item["text"]+" ";
});

function optionalChars(str,number)
{
    if(typeof number !== 'string'){
        number='*';
    }

    return '['+str+']'+number;
}

function removeHarakatOfLastHarf(text){
    //add space to end
    //search by harakat followed by space
    text=text+' ';
    text=text.replace(new RegExp(optionalChars(kul_alharakat,'+')+' ',regex_flags),' ');//  preg_filter('/'.optionalChars(kul_alharakat).' /u',' ',$text.' ');
    return text.slice(0, -1); //removes last space
}

function addAfterEachLetter(add_str,str)
{
    var str_result='';

    var chars_arr=str.split("");

    var ignored_chars = ':<>!{}+-.(|)[]*?؟$^ ْ' + numbers + kul_alharakat;
    const ignored_chars_arr = ignored_chars.split("");
    const count_chars = chars_arr.length;
    for(var i=0; i< count_chars; i++){
        const current_char=chars_arr[i];
        str_result+=current_char;
        if(!ignored_chars.includes(current_char)){
            str_result+=add_str;
        }
    }

    return str_result;
}

function getRegexPatternForString(text)
{

    text = addAfterEachLetter(optionalChars(kul_alharakat), text);

    // use ".." to match any number of words
    text = text.replace(/\s\.\.\s/g,"(?:\\s\.)*?\\s");
    //text = text.replace(/\s\.\.\s/g,"(?:\\s[^"++"])*\\s");

    // use "." to match any number of chars in a word
    text = text.replace(/\./g,not_space+"*");

    // use "_" to match harf wa7ed in a word
    text = text.replace(/[ـ_]/g,"["+kul_huroof+"]");

    text = text.replace(/؟/g,"?");

    text = text.replace(new RegExp("["+arabic_numbers+"]",'g'),function(number){
        return arabic_to_english_number(number);
    });

    text = text.replace(/(\d)/g,"\\$1");

    // set SHADDA and Harakah in the proper order
    text = text.replace(SHADDA + FATHA,FATHA + SHADDA);
    text = text.replace(SHADDA + KASRA,KASRA + SHADDA);
    text = text.replace(SHADDA + DAMMA,DAMMA + SHADDA);

    // remove duplicated spaces
    text = text.replace(/\s+/g," ");

    text = new RegExp(text,regex_flags);

    return text;
}

var uniqueItems = function (data, key) {
    var result = new Set();

    for (var i = 0; i < data.length; i++) {
        const values_arr = valueShouldBeArray(data[i][key]);

        for (var j = 0; j < values_arr.length; j++) {
            const value = values_arr[j];
            result.add(value);
        }
    }

    return Array.from(result);
};

function valueShouldBeArray(variable) {
    if (Array.isArray(variable)) {
        return variable;
    } else {
        return [variable];
    }
}

var countByAttributes= function(data, attributes){
    var countedData=[];
    for(var i=0;i<attributes.length;i++){
        var str = attributes[i];
        //countedData[str]=0;
        countedData[str]=[];
    }

    //var cleanArray=[];

    for(var i=0;i<data.length;i++){
        for(var j=0;j<attributes.length;j++){
            const data_attribute=attributes[j];
            var currentAttributeData = data[i][data_attribute];

            //insure it is an array:
            var currentDataArray=valueShouldBeArray(currentAttributeData);

            for(var k=0;k<currentDataArray.length;k++){
                const currentData=currentDataArray[k];
                if(typeof countedData[data_attribute][currentData] === 'number'){
                    countedData[data_attribute][currentData]++;
                }
                else{
                    countedData[data_attribute][currentData]=1;
                }
            }

        }

        //cleanArray[data_attribute]=[];
        //var countedData2 = countedData[data_attribute];
        //for(var key in countedData2) {
        //    cleanArray[data_attribute]={'attribute_value':key,'count':countedData2[key]};
        //}
    }

    return countedData;
};

function replaceRange(string, start, end, substitute) {
    return string.substring(0, start) + substitute + string.substring(end);
}

function highlightText(input, regex, highlightOnlyGroups) {
    let startHighlightTag = "<span class='highlightedText'>";
    let endHighlightTag = "</span>";
    let startHighlightTagLength = startHighlightTag.length;
    let endHighlightTagLength = endHighlightTag.length;
    let addedStartTagsIndices = [];
    let addedEndTagsIndices = [];
    var highlightedText = input;

    function getModifiedContentsLengthBefore(start) {
        let startTagsLength = addedStartTagsIndices.filter((index) => index <= start).length * startHighlightTagLength;
        let endTagsLength = addedEndTagsIndices.filter((index) => index <= start).length * endHighlightTagLength;
        return startTagsLength + endTagsLength;
    }

    var matches = null;
    while (matches = regex.exec(input)) {
        if (matches.length === 0 || (matches[0]+"").trim() == "") {
            if (regex.lastIndex === matches.index) {
                // prevent infinite loop
                regex.lastIndex += 1;
            }
            continue;
        }

        // highlight only captured groups
        if (highlightOnlyGroups && matches.length > 1) {
            matches.shift(1);
            matches.indices.shift(1);
        }

        for (let i = 0; i < matches.length; i++) {
            let currentMatch = matches[i];
            let currentMatchIndex = matches.indices[i];
            let start = currentMatchIndex[0];
            let modifiedStart = start + getModifiedContentsLengthBefore(start);
            let end = currentMatchIndex[1];
            let length = end - start;
            let modifiedEnd = modifiedStart + length;
            addedStartTagsIndices.push(start);
            addedEndTagsIndices.push(end);
            highlightedText = replaceRange(highlightedText, modifiedStart, modifiedEnd, startHighlightTag + currentMatch + endHighlightTag);
        }
    }

    return highlightedText;
}

function getTrueKeys(input) {
    const trueKeys = [];

    for (const key in input) {
        if (input.hasOwnProperty(key) && input[key] === true) {
            trueKeys.push(key);
        }
    }

    return trueKeys;
}

function mapToTrueObject(keys) {
    const result = {};

    keys.forEach(key => {
        result[key] = true;
    });

    return result;
}

myApp.config(function($routeProvider) {
    $routeProvider
        .when("/search", {
            templateUrl : "view/search.html",
            controller : "AyatSearchController"
        })
        .when("/surah", {
           templateUrl : "view/surah.html",
           controller : "SurahCtrl"
        })
        .otherwise({
            redirectTo: '/search'
        });
});

myApp.controller('SurahCtrl',function ($scope, $http, $routeParams, $location, $anchorScroll) {
    let harakat_regex = /[\u064B-\u065F]/g;
    $scope.all_suwar = all_suwar.map(function(surah) {
        surah.title_without_harakat = surah.title.replace(harakat_regex, "");
        return surah;
    });
    $scope.$watch('selected_surah', function(surah) {
        $scope.ayat_surah = all_ayat.filter(item => item.sura_id === surah.order);
    });
    var selected_surah_id = ($location.search()["id"] || "1") - 1;
    $scope.selected_surah = all_suwar[selected_surah_id];
    $scope.searchText = "";

    $scope.scrollTo = function(id) {
        $location.hash(id);
        $anchorScroll();
    };

    // scroll to Ayah
    $scope.$on('$viewContentLoaded', function() {
        setTimeout(function() {
            $location.hash($location.hash());
            $anchorScroll();
        },200);
    });
});

myApp.controller('AyatSearchController',function ($scope, $http, $routeParams, $location, $timeout) {
    allow_pagination($scope);
    //init filters
    let urlQueryParameters = $location.search();
    let filter_results = (urlQueryParameters["filter_results"] || "");
    if (filter_results != getTrueKeys($scope.useResults).join(",")) {
        $scope.useResults = mapToTrueObject(filter_results.split(","));
    } else {
        $scope.useResults = {};
    }
    let filter_suwar = (urlQueryParameters["filter_suwar"] || "");
    if (filter_suwar != getTrueKeys($scope.useSuwar).join(",")) {
        $scope.useSuwar = mapToTrueObject(filter_suwar.split(","));
    } else {
        $scope.useSuwar = {};
    }

    $scope.suwar=all_suwar;
    $scope.searchStr='';

    $scope.FATHA = FATHA
    $scope.DAMMA = DAMMA
    $scope.KASRA = KASRA
    $scope.SHADDA = SHADDA
    $scope.SUKUN = SUKUN

    // boolean or string, to be used in the matched strings in the sidebar
    var removeLastHarakah = $location.search()["remove_harakah"];
    if (typeof removeLastHarakah === 'string' || removeLastHarakah instanceof String) {
        // as the browser will have the string value only in case of 'false'
        removeLastHarakah = removeLastHarakah !== 'false';
    }
    $scope.shouldRemoveLastHarakah = removeLastHarakah

    // Number of items to load initially
    const initialLoadCount = 200;
    $scope.visibleFoundWords = [];

    // Function to load more items as the user scrolls
    $scope.loadMoreItems = function() {
        const totalVisibleItems = $scope.visibleFoundWords.length;
        const batchSize = 1000; // Number of items to load each time

        if (totalVisibleItems < $scope.resultsGroup.length) {
            const nextBatch = $scope.resultsGroup.slice(totalVisibleItems, totalVisibleItems + batchSize);
            $scope.visibleFoundWords = $scope.visibleFoundWords.concat(nextBatch);
        }
    };

    var matchAyat = function (newValue) {
        var filtered_ayat=all_ayat.filter(function(item){
            var foundStr = item["text"].match($scope.searchStr);
            return foundStr!==null;
        });

        return filtered_ayat.map(function(ayah){

            ayah["exact_match"]=[];
            ayah["matched"]=[];
            ayah["text_with_highlight"]=ayah["text"];

            var match = null;
            while( match = $scope.searchStr.exec( ayah["text"])){
                var foundStr=match;

                if((foundStr+"").trim() == "") {
                    if ($scope.searchStr.lastIndex == foundStr.index) {
                        // prevent infinite loop
                        $scope.searchStr.lastIndex += 1;
                    }
                    continue;
                }

                let wholeMatchedPart = foundStr[0];
                // remove the exact match if there is a captured group or more
                if(foundStr.length>1){
                    foundStr.shift();
                }

                //item["text"].slice(foundStr.index,foundStr.index+foundStr[1].length)

                ayah["exact_match"]=ayah["exact_match"].concat(foundStr); //remove first matching result
                ayah["matched"]=ayah["matched"].concat(foundStr.map(function(str){
                    if ($scope.shouldRemoveLastHarakah) {
                        return removeHarakatOfLastHarf(str);
                    } else {
                        return str;
                    }
                }));
            }

            ayah["text_with_highlight"]=highlightText(ayah["text_with_highlight"], $scope.searchStr);

            return ayah;
        });
    };

    $scope.$watch('searchStr', function(newValue) {

        $scope.query='';

        $scope.foundAyat = matchAyat(newValue);
        $scope.foundAyat = $scope.foundAyat.filter(function (item) {
            return item['matched']!==null;
        });
        $scope.countedAyahAttributes=countByAttributes($scope.foundAyat,['matched','sura_id']);
        $scope.sortBy = "counts";
        $scope.changeCountsAsPerFilter = false;

        // Watch the search results that are selected
        let filterListener = function (value) {
            var selected;

            $scope.count = function (prop, value) {
                return function (el) {
                    return el[prop] == value;
                };
            };

            $scope.resultsGroup = uniqueItems($scope.foundAyat, 'matched');
            // Sort the array in ascending order
            $scope.sortResultsGroup = function() {
                if ($scope.sortBy == "letters") {
                    $scope.resultsGroup = $scope.resultsGroup.sort((a, b) => a.localeCompare(b));
                } else if ($scope.sortBy == "counts") {
                    $scope.resultsGroup = $scope.resultsGroup.sort(function (a, b) {
                        var firstCounts = $scope.countedAyahAttributes['matched'][a]+0;
                        firstCounts = isNaN(firstCounts) ? 0 : firstCounts;
                        var secondCounts = $scope.countedAyahAttributes['matched'][b]+0;
                        secondCounts = isNaN(secondCounts) ? 0 : secondCounts;
                        return secondCounts - firstCounts;
                    });
                }
            };

            var uniqueAyat = new Set();
            var filterAfterResults = [];
            selected = false;
            for (var j in $scope.foundAyat) {
                var p = $scope.foundAyat[j];
                for (var i in $scope.useResults) {
                    if ($scope.useResults[i]) {
                        selected = true;
                        var matches=valueShouldBeArray(p.matched);

                        for(var k=0;k<matches.length;k++){
                            if (i == matches[k]) {
                                uniqueAyat.add(p);
                                break;
                            }
                        }

                    }
                }
            }
            filterAfterResults = Array.from(uniqueAyat);
            if (!selected) {
                filterAfterResults = $scope.foundAyat;
            }

            if (filterAfterResults.length == 0) {
                $location.search( "filter_results", "");
            }

            $scope.suwarGroup = uniqueItems($scope.foundAyat, 'sura_id');
            $scope.sortSuwarGroup = function() {
                if ($scope.sortBy == "letters") {
                    $scope.suwarGroup = $scope.suwarGroup.sort(function (a, b) {
                        var firstSurah = $scope.suwar[a-1].title;
                        var secondSurah = $scope.suwar[b-1].title;
                        return firstSurah.localeCompare(secondSurah);
                    });
                } else if ($scope.sortBy == "counts") {
                    $scope.suwarGroup = $scope.suwarGroup.sort(function (a, b) {
                        var firstCounts = $scope.countedAyahAttributes['sura_id'][a] + 0;
                        firstCounts = isNaN(firstCounts) ? 0 : firstCounts;
                        var secondCounts = $scope.countedAyahAttributes['sura_id'][b]+0;
                        secondCounts = isNaN(secondCounts) ? 0 : secondCounts;
                        return secondCounts - firstCounts;
                    });
                }
            };

            var filterAfterSuwar = [];
            selected = false;
            for (var j in filterAfterResults) {
                var p = filterAfterResults[j];
                for (var i in $scope.useSuwar) {
                    if ($scope.useSuwar[i]) {
                        selected = true;
                        if (i == p.sura_id) {
                            filterAfterSuwar.push(p);
                            break;
                        }
                    }
                }
            }
            if (!selected) {
                filterAfterSuwar = filterAfterResults;
            }

            if (filterAfterSuwar.length == 0) {
                $location.search( "filter_suwar", "");
            }

            $scope.filteredAyat = filterAfterSuwar;

            if ($scope.changeCountsAsPerFilter) {
                $scope.countedAyahAttributes = countByAttributes($scope.filteredAyat, ['matched', 'sura_id']);
            } else {
                $scope.countedAyahAttributes = countByAttributes($scope.foundAyat, ['matched', 'sura_id']);
            }

            $scope.sortResultsGroup();
            $scope.sortSuwarGroup();

            // reset pagination
            $scope.currentPage = 0;

            // now group by pages
            $scope.groupToPages();

        };

        $scope.$watch(function () {
            return {
                //foundAyat: $scope.foundAyat,
                useResults: $scope.useResults,
                useSuwar: $scope.useSuwar,
            }
        }, function () {
            filterListener();
            let resetPositions = $scope.changeCountsAsPerFilter && $scope.sortBy === "counts";
            if ($scope.visibleFoundWords.length === 0 || resetPositions) {
                $scope.visibleFoundWords = $scope.resultsGroup.slice(0, initialLoadCount);
            }
            let filterResultsKeys = getTrueKeys($scope.useResults).join(",");
            if ($location.search()["filter_results"] !== filterResultsKeys) {
                $location.search( "filter_results", filterResultsKeys);
            }
            let filterSuwarKeys = getTrueKeys($scope.useSuwar).join(",");
            if ($location.search()["filter_suwar"] !== filterSuwarKeys) {
                $location.search( "filter_suwar", filterSuwarKeys);
            }
        }, true);

        $scope.$watch(function () {
            return {
                updateCounts: $scope.changeCountsAsPerFilter,
                sortBy: $scope.sortBy
            }
        }, function () {
            filterListener();
            $scope.visibleFoundWords = $scope.resultsGroup.slice(0, initialLoadCount);
        }, true);


        $scope.$watch('filtered', function (newValue) {
            if (angular.isArray(newValue)) {
                console.log(newValue.length);
            }
        }, true);

        // Utility functions
        $scope.searchRegex = function (item) {
            return item.match(new RegExp($scope.regexStrToSearch,"u"));
        };

    });

    // Function to handle the scroll event and trigger loading more items
    function onScroll() {
        const element = angular.element(".scroll-container")[0];
        let loadingOffset = 150;
        let isFullyLoaded = $scope.visibleFoundWords.length === $scope.resultsGroup.length
        if (!isFullyLoaded && !$scope.isLoading && element.scrollTop + element.clientHeight + loadingOffset >= element.scrollHeight) {
            $scope.isLoading = true;
            $scope.$apply($scope.loadMoreItems);
            $timeout(function() {
                $scope.isLoading = false;
            }, 300);
        }
    }

    // Bind the scroll event handler to the scrollable container
    angular.element(".scroll-container").on('scroll', onScroll);

    //allow_pagination($scope);

    //just to test watcher
    var initSearchStr = 'والله .ِي. .ِي.';
    var search = ($location.search()["s"] || "");

    if(search != ""){
        initSearchStr = search;
    }

    $scope.regex_query = initSearchStr;

    $scope.searchStr=getRegexPatternForString(initSearchStr);

    $scope.searchButtonClicked = function() {
        //reset filters
        $location.search( "filter_results", "");
        $location.search( "filter_suwar", "");
        $location.search( "s", $scope.regex_query );
        $location.search( "remove_harakah", $scope.shouldRemoveLastHarakah );
    };

    $scope.appendToCurrentTypingCursor = function(text) {
        // Get the input element
        var input = document.getElementById("search-input");

        // Get the current value of the input
        var inputValue = input.value;

        // Get the current cursor position
        var cursorPos = input.selectionStart;

        // Concatenate the new character at the current cursor position
        var newValue = inputValue.substring(0, cursorPos) + text + inputValue.substring(cursorPos);

        // Set the new value of the input
        input.value = newValue;
        $scope.regex_query = newValue

        // Move the cursor to the next position
        let newPosition = cursorPos + text.length
        input.setSelectionRange(newPosition, newPosition);
        input.focus();
    };

    $scope.clearResultsFilter = function() {
        $scope.useResults = {};
    };

    $scope.clearSuwarFilter = function() {
        $scope.useSuwar = {};
    };

    $scope.$on( "$locationChangeSuccess", handleLocationChange );

    // I handle the location changes and make sure the view is updated.
    function handleLocationChange( event ) {
        if ($location.path() != "/search") {
            return;
        }
        let urlQueryParameters = $location.search();
        let search = (urlQueryParameters["s"] || "");
        if (search !== $scope.regex_query) {
            $scope.searchStr = getRegexPatternForString(search); // This will trigger $watch expression to kick in
        }
        let filter_results = (urlQueryParameters["filter_results"] || "");
        if (filter_results !== getTrueKeys($scope.useResults).join(",")) {
            $scope.useResults = mapToTrueObject(filter_results.split(","));
        }
        let filter_suwar = (urlQueryParameters["filter_suwar"] || "");
        if (filter_suwar !== getTrueKeys($scope.useSuwar).join(",")) {
            $scope.useSuwar = mapToTrueObject(filter_suwar.split(","));
        }
    }
});

myApp.filter('groupBy',
    function () {
        return function (collection, key) {
            if (collection === null) return;
            return uniqueItems(collection, key);
        };
    });

function highlight(str,str_to_highlight){
    return str.replace(str_to_highlight,'<b class="highlightedText">'+str_to_highlight+'</b>');
}

function surah_name(id){
    return all_suwar[id].title;
}

function allow_pagination($scope){

    $scope.itemsPerPage = 20;
    $scope.pagedItems = [];
    $scope.currentPage = 0;

    // calculate page in place
    $scope.groupToPages = function () {
        $scope.pagedItems = [];

        for (var i = 0; i < $scope.filteredAyat.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredAyat[i] ];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredAyat[i]);
            }
        }
    };

    $scope.range = function (start, end) {
        var ret = [];
        if (!end) {
            end = start;
            start = 0;
        }
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        return ret;
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage++;
        }
    };

    $scope.setPage = function () {
        $scope.currentPage = this.n;
    };

}
