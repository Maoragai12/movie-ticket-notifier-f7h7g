/* eslint-disable max-len */
'use strict';

const fetch = require('node-fetch');
const aws = require('aws-sdk');

const names = [ 'ספיידרמן: אין דרך הביתה', 'התיבה ךרד ןיא :ןמרדייפס' ];

exports.handler = async () => {
    const response = await fetch('https://www.yesplanet.co.il/il/data-api-service/v1/10100/trailers/byCinemaId/1072'); // 1072 - Rishon Leziyon
    const json = await response.json();
    const movies = json.body;
    const movie = movies?.find(m =>
        names.includes(m.filmName)
        || m.filmLink.includes('spiderman')
        || m.filmLink.includes('spider-man')
        || m.filmId === '4601s2r',
    );
    const movieName = 'Spider-man No Way Home';
    const log = {
        'Movie Name': movieName,
        'Available for pre-order': !!movie,
        ...(movie && { 'Link': movie.filmLink, 'Location': 'Yes Planet' }),
    };

    const channel = process.env.SLACK_CHANNEL_OFFTOPIC;
    const subject = `* 🚨 Hurry up! ${movieName} tickets goes on sale! 🚨 *`;
    const body = [
        `Movie Name: *${movieName}*`,
        `Available for pre-order: *${!!movie}*`,
        `Link: ${movie?.link}`,
        `Location: Yes Planet - Rishon Leziyon`,
    ].join('\n');

    const options = {
        'Message': JSON.stringify({ channel, subject, body }),
        'TopicArn': process.env.AWS_SLACK_SNS_TOPIC_ARN
    };

    const sns = new aws.SNS();
    console.log('%j', log);
    return movie ? sns.publish(options).promise() : null;
};
