const express = require('express');
const router = express.Router();
var request = require('request-promise');
var Cookie = require('request-cookies').Cookie;
const { google } = require('googleapis');
const customsearch = google.customsearch('v1');
require('dotenv').config()

// @route     POST /api/search
// @desc      Search for PS_TOKENs
router.post('/', async (req, res) => {
    let { query, exclude = [] } = req.body;

    if (query === null) {
        res.status(401).json('Empty Query');
        return;
    }

    console.log(query);
    const searchOptions = {
        cx: process.env.SEARCH_ENGINE_ID,
        q: query,
        auth: process.env.API_KEY,
        siteSearch: exclude.join(' '),
        siteSearchFilter: 'e'
    }

    // @todo create mock response for development use
    try {
        googleResponse = await customsearch.cse.list(searchOptions);
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }

    const searchResults = googleResponse.data.items;

    if (!searchResults) {
        res.status(401).json('No Search Results');
        return;
    }

    const psTokenResults = await Promise.all(
        searchResults.map(
            async (result) => {
                const { link, displayLink, formattedUrl } = result;
                var cookieJar = request.jar();

                /* Trimmed query params to solve issues fosr some urls */
                try {
                    await request({
                        url: link.split("?")[0],
                        method: 'GET',
                        jar: cookieJar,
                        resolveWithFullResponse: true,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36'
                        }
                    });
                } catch (err) {
                    console.error(err.message);
                    return { displayLink };
                };

                const cookies = cookieJar._jar.getCookiesSync(link);
                const psTokenCookie = cookies.find((x) => x.key === 'PS_TOKEN');
                if (psTokenCookie === undefined) {
                    return { displayLink };
                }

                const { value, domain } = psTokenCookie;

                return { value, link, displayLink, domain, formattedUrl };

            }
        )
    );

    // add excluded domains for next request
    exclude = exclude.concat(psTokenResults.map(token => token.displayLink));

    const tokens =  psTokenResults.filter(token => token.value != null);
    res.status(200).json({ tokens, exclude });

});

module.exports = router;
