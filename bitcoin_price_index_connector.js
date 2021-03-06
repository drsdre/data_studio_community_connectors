
//This Google Data Studio Community Connector uses API from CoinDesk (https://www.coindesk.com/api/) to fetch 
//Bitcoin Price Index Data for last 1 Year.
//Rates are displayed in USD by default. Choose a different currency using your configuration while setting it up with 
//Data Studio.


function getConfig(request) {
    return {
        'configParams': [
            {
                type: 'INFO',
                name: 'BPI',
                text: 'This connector pulls data of Bitcoin Price Index for last 1 year. Rates are quoted in USD by default.'
            },
            {
                'type': 'SELECT_SINGLE',
                'name': 'CURRENCY',
                'displayName': 'Select Currency:',
                'helpText': 'Select the Currency you want to see the rates in:',
                'options': [
                    {label: 'Australian Dollar', value: 'AUD'},
                    {label: 'Canadian Dollar', value: 'CAD'},
                    {label: 'Swiss Franc', value: 'CHF'},
                    {label: 'Euro', value: 'EUR'},
                    {label: 'Pak Rupee', value: 'PKR'},
                    {label: 'US Dollar', value: 'USD'}
                ]
            }
        ]
    };
}

var BitCoinPriceIndexDataSchema = [
    // The schema for the given request, providing information on the organization and type of data.
    {
        name: 'date',
        label: 'Date',
        dataType: 'STRING',
        semantics: {conceptType: 'DIMENSION'}
    },
    {
        name: 'rate',
        label: 'Bitcoin Price',
        dataType: 'NUMBER',
        semantics: {
            conceptType: 'METRIC',
            isReaggregatable: true
        }
    }
];

function getSchema(request) {
    return {
        schema: BitCoinPriceIndexDataSchema
    };
}

function getData(request) {
    var currency = request.configParams['CURRENCY'] || 'USD';

    // Prepare the schema for the fields requested.
    var dataSchema = [];
    dataSchema = request.fields.map(function (i) {
        var item = BitCoinPriceIndexDataSchema.filter (function (j) {
            if (i.name === j.name) {
                return j;
            }
        });
        return item[0];
    });



    // Fetch the data
    var response = JSON.parse(makeRequest(currency)).bpi;

    // Prepare the tabular data.
    var rows = makeTabularData(response);

    // Return the tabular data for the given request.
    return {
        schema: dataSchema,
        rows: rows
    };
}

function makeRequest(currency) {
    var startDate = new Date();
    startDate.setYear(startDate.getFullYear() - 1);
    startDate = startDate.toISOString().slice(0, 10);
    var endDate = new Date().toISOString().slice(0, 10);
    // Fetch the data with UrlFetchApp, e.g.:
    var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?currency=' + currency + '&start=' + startDate + '&end=' + endDate;
    return UrlFetchApp.fetch(url);
}

function makeTabularData(bpiValues) {
    var data = [];
    for (var i in bpiValues) {
        var values = [];
        values.push(i);
        values.push(bpiValues[i]);
        data.push({
            values: values
        });
    }
    return data;
}

function getAuthType() {
    // Returns the authentication method required.
    return {
        'type': 'NONE'
    };
}
