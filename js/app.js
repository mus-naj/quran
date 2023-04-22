var myApp = angular.module('myApp', ['ngSanitize','ngRoute']);

//constants
const not_space ='[^\\s]';
const alharakat_mufradah = 'َُِ';
const alharakat_tanween = 'ًٌٍ';
const numbers='1234567890';
const arabic_numbers='١٢٣٤٥٦٧٨٩٠';
const alharakat_other = 'ّْ';
const kul_alharakat = alharakat_mufradah + alharakat_tanween + alharakat_other + 'ٰ';
const huroof = 'ابتثجحخدذرزسشصطضظعغفقكلمنهوي';
const special_huroof = 'ةى';
const ahrof_alela = 'اويى';
const ahrof_hamzah = 'اأإآؤئءٰ';
const kul_huroof = ahrof_hamzah + huroof + special_huroof;
const huroof_wa_harakat = kul_huroof + kul_alharakat;

const FATHATAN = "\u064B"; // ً
const DAMMATAN = "\u064C"; // ٌ
const KASRATAN = "\u064D"; // ٍ
const FATHA = "\u064E"; // َ
const DAMMA = "\u064F"; // ُ
const KASRA = "\u0650"; // ِ
const SHADDA = "\u0651"; // ّ
const SUKUN = "\u0652"; // ْ

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

    var ignored_chars = '.(|)[]*?؟$^ ْ'+numbers;
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
    text = text.replace(/\s\.\.\s/g,"(?:\\s\.)*\\s");
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

    text = new RegExp(text,regex_flags);

    return text;
}

var uniqueItems = function (data, key) {
    var result = [];

    for (var i = 0; i < data.length; i++) {
        const values_arr = valueShouldBeArray(data[i][key]);

        for(var j=0;j<values_arr.length;j++){
            const value=values_arr[j];
            if (result.indexOf(value) === -1) {
                result.push(value);
            }
        }

    }
    return result;
};

function valueShouldBeArray(variable) {
    if (Array.isArray(variable)) {
        return variable;
    }
    else {
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
        //.when("/surah", {
        //    templateUrl : "surah.html",
        //    controller : "SurahCtrl"
        //})
        .otherwise({
            redirectTo: '/search'
        });
});

myApp.controller('AyatSearchController',function ($scope, $http, $routeParams, $location) {
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

    var matchAyat = function (newValue) {
        var filtered_ayat=all_ayat.filter(function(item){
            var foundStr = item["text"].match($scope.searchStr);
            return foundStr!==null;
        });

        return filtered_ayat.map(function(item){

            item["exact_match"]=[];
            item["matched"]=[];
            item["text_with_highlight"]=item["text"];

            var match = null;
            while( match = $scope.searchStr.exec( item["text"])){
                var foundStr=match;

                if(foundStr.length>1){
                    foundStr.shift();
                }

                //item["text"].slice(foundStr.index,foundStr.index+foundStr[1].length)

                item["exact_match"]=item["exact_match"].concat(foundStr); //remove first matching result
                item["matched"]=item["matched"].concat(foundStr.map(function(str){ return removeHarakatOfLastHarf(str); }));

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

        // Watch the search results that are selected
        $scope.$watch(function () {
            return {
                //foundAyat: $scope.foundAyat,
                useResults: $scope.useResults,
                useSuwar: $scope.useSuwar
            }
        }, function (value) {
            var selected;

            $scope.count = function (prop, value) {
                return function (el) {
                    return el[prop] == value;
                };
            };

            $scope.resultsGroup = uniqueItems($scope.foundAyat, 'matched');
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

            //@todo: (checkbox) to update counts based on used filters
            if(true){
                $scope.countedAyahAttributes=countByAttributes($scope.filteredAyat,['matched','sura_id']);
            }
            else{
                $scope.countedAyahAttributes=countByAttributes($scope.foundAyat,['matched','sura_id']);
            }

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

        // Move the cursor to the next position
        input.selectionStart = cursorPos + text.length;
        input.selectionEnd = cursorPos + text.length;
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
