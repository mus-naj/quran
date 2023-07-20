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

var regex_flags='gu';

try{
    new RegExp("",regex_flags);
}
catch(exp){
    regex_flags='g';
}

function arabic_to_english_number(number){
    return numbers[arabic_numbers.search(number)];
}

//add space to begining and end of ayat text
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
    $scope.useResults = {};
    $scope.useSuwar = {};

    $scope.suwar=all_suwar;
    $scope.searchStr='';

    $scope.FATHA = FATHA
    $scope.DAMMA = DAMMA
    $scope.KASRA = KASRA
    $scope.SHADDA = SHADDA
    $scope.SUKUN = SUKUN

    var removeLastHarakah = !!($location.search()["remove_harakah"]);
    $scope.shouldRemoveLastHarakah = removeLastHarakah

    // Number of items to load initially
    const initialLoadCount = 100;
    $scope.visibleFoundWords = [];

    // Function to load more items as the user scrolls
    $scope.loadMoreItems = function() {
        const totalVisibleItems = $scope.visibleFoundWords.length;
        const batchSize = 50; // Number of items to load each time

        if (totalVisibleItems < $scope.resultsGroup.length) {
            const nextBatch = $scope.resultsGroup.slice(totalVisibleItems, totalVisibleItems + batchSize);
            $scope.visibleFoundWords = $scope.visibleFoundWords.concat(nextBatch);
        }
    };

    var matchAyat = function (newValue) {
        var filtered_ayat=all_ayat.filter(function(item){
            var foundStr = item["text"].match($scope.searchStr);
            // TODO: use foundStr: RegExpMatchArray, to highlight the text properly
            return foundStr!==null;
        });

        return filtered_ayat.map(function(item){

            item["exact_match"]=[];
            item["matched"]=[];
            item["text_with_highlight"]=item["text"];

            var match = null;
            while( match = $scope.searchStr.exec( item["text"])){
                var foundStr=match;

                if((foundStr+"").trim() == "") {
                    continue;
                }

                // remove the exact match if there is a captured group or more
                if(foundStr.length>1){
                    foundStr.shift();
                }

                //item["text"].slice(foundStr.index,foundStr.index+foundStr[1].length)

                item["exact_match"]=item["exact_match"].concat(foundStr); //remove first matching result
                item["matched"]=item["matched"].concat(foundStr.map(function(str){
                    if ($scope.shouldRemoveLastHarakah) {
                        return removeHarakatOfLastHarf(str);
                    } else {
                        return str;
                    }
                }));

                //"<span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>رَبَّنَا</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>وَاجْعَلْنَا</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>مُسْلِمَيْنِ</span><span<span class='highlightedText'> </span>class='highlightedText'><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>لَكَ</span></span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>وَمِنْ</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>ذُرِّيَّتِنَا</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>أُمَّةً</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>مُسْلِمَةً</span><span<span class='highlightedText'> </span>class='highlightedText'><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>لَكَ</span></span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>وَأَرِنَا</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>مَنَاسِكَنَا</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>وَتُبْ</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>عَلَيْنَا</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>ۖ</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>إِنَّكَ</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>أَنْتَ</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>التَّوَّابُ</span><span<span class='highlightedText'> </span>class='highlightedText'><span class='highlightedText'> </span>الرَّحِيمُ</span><span class='highlightedText'> </span>"

                foundStr.forEach(function (str) {
                    item["text_with_highlight"]=item["text_with_highlight"].replace(new RegExp(str,'g'),"<span class='highlightedText'>"+str+"</span>");
                });
            }

            return item;
        });
    };

    $scope.$watch('searchStr', function(newValue) {

        //reset filters
        $scope.useResults = {};
        $scope.useSuwar = {};
        $scope.query='';

        $scope.foundAyat = matchAyat(newValue);
        $scope.foundAyat = $scope.foundAyat.filter(function (item) {
            return item['matched']!==null;
        });
        $scope.countedAyahAttributes=countByAttributes($scope.foundAyat,['matched','sura_id']);
        $scope.sortBy = "counts";
        $scope.changeCountsAsPerFilter = false;

        // Watch the search results that are selected
        $scope.$watch(function () {
            return {
                //foundAyat: $scope.foundAyat,
                useResults: $scope.useResults,
                useSuwar: $scope.useSuwar,
                updateCounts: $scope.changeCountsAsPerFilter,
                sortBy: $scope.sortBy
            }
        }, function (value) {
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
                                filterAfterResults.push(p);
                                break;
                            }
                        }

                    }
                }
            }
            if (!selected) {
                filterAfterResults = $scope.foundAyat;
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

            $scope.filteredAyat = filterAfterSuwar;

            if ($scope.changeCountsAsPerFilter) {
                $scope.countedAyahAttributes = countByAttributes($scope.filteredAyat, ['matched', 'sura_id']);
            } else {
                $scope.countedAyahAttributes = countByAttributes($scope.foundAyat, ['matched', 'sura_id']);
            }

            $scope.sortResultsGroup();
            $scope.sortSuwarGroup();
            $scope.visibleFoundWords = $scope.resultsGroup.slice(0, initialLoadCount);

            // reset pagination
            $scope.currentPage = 0;

            // now group by pages
            $scope.groupToPages();

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
        if (!$scope.isLoading && element.scrollTop + element.clientHeight + loadingOffset >= element.scrollHeight) {
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
        var search = ($location.search()["s"] || "");
        $scope.searchStr = getRegexPatternForString(search); // This will trigger $watch expression to kick in
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
