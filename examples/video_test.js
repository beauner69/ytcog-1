// ytcog - innertube library - example to test channel class
// (c) 2021 gatecrasher777
// https://github.com/gatecrasher777/ytcog
// MIT Licenced

const ytcog = require('../lib/index');
const ut = require('../lib/ut.js')();
const fs = require('fs');

//User editable data:
let app = {
    cookie: '',
    userAgent: '',
    test_options: {
        id: 'UoHEvzQc0O4', //any video id
        published: 0, //optional published timestamp
        path: './examples', //supplay a download folder for downloaded video
        filename: '', //supply a optional filename, do not include an extension. default filename is author_title_videoId_format.ext
        container: 'mkv',  //any, mp4, webm, mkv 
        videoQuality: '1080p', //desired quality: highest, 1080p, 720p, 480p, medium, 360p, 240p, 144p, lowest
        audioQuality: 'medium', //desired audio quality: high, medium, low
        mediaBitrate: 'highest', //for streams of equal resolution/quality pick the highest or lowest bitrate.
        videoFormat: -1, //Specific video format (-1 use above options to rank video streams)
        audioFormat: -1, //Specific audio format (-1 use above options to rank audio streams)
        progress: (prg,siz)=>{  //supply a callback for download progress;
            process.stdout.write(`Progress ${Math.floor(prg)}%\r`);
        } 
    }
}

async function run() {
    let session = new ytcog.Session(app.cookie,app.userAgent);
    await session.fetch();
    console.log(`Session status: ${session.status} (${session.reason})`);
    if (session.status == 'OK') {
        if (session.loggedIn) {
            console.log('\nYour are logged into YouTube. Enjoy.');
        } else {
            console.log('\nYou are not logged into YouTube. As a consequence: \nSome downloads in ytcog may not work \nYou may experience rate limiting and age-restrictions.');
        }
        let video = new ytcog.Video(session,app.test_options);        
        console.log('\nFetch video metadata and streams');
        await video.fetch();
        console.log(`Video status: ${video.status} (${video.reason})`);
        if (video.status=='OK') {         
            console.log('\nVideo info saved to ./examples/video_info.json');
            let output = video.info(['cookie','userAgent','options','sapisid','status','reason','cancelled']);
            fs.writeFileSync('./examples/video_info.json',ut.jsp(output),'utf8');
            console.log('Video json to ./examples/video.json');
            fs.writeFileSync('./examples/video.json',ut.jsp(video.data),'utf8');
            console.log('\nAvailable media streams:');
            console.log(video.streamInfo);
            console.log('\nStreams expire in '+ut.secDur(video.timeToExpiry,'hms'));
            console.log(`\nDownloading test video using given test options`);
            await video.download();
            console.log(`\n\nVideo status: ${video.status} (${video.reason})`);
            if (video.downloaded) {
                console.log(`Success - video saved to ${video.fn}`);
                console.log(`\nDownloading video using video stream 3 and audio stream 1 (mp4 only)`);
                await video.download({videoFormat: 3, audioFormat: 1, filename: 'custom_video'});
                console.log(`\n\nVideo status: ${video.status} (${video.reason})`);
                if (video.downloaded) {
                    console.log(`Success - custom video saved to ${video.fn}`);
                    console.log(`\nDownloading video only`);
                    video.updateOptions(app.test_options); //revert to defaults
                    await video.download({audioQuality: 'none', filename: 'video only'});
                    console.log(`\n\nVideo status: ${video.status} (${video.reason})`);
                    if (video.downloaded) {
                        console.log(`Success - video only saved to ${video.fn}`);
                        console.log(`\nDownloading audio only`);
                        video.updateOptions(app.test_options); //revert to defaults
                        await video.download({videoQuality: 'none', filename: 'audio only'});
                        console.log(`\n\nVideo status: ${video.status} (${video.reason})`);
                        if (video.downloaded) {
                            console.log(`Success - audio only saved to ${video.fn}`);                            
                        }
                    }
                }
            }
        }
    }
}

if (process.argv.length==2) {
    run();
} else if (process.argv.length==3) {
    app.test_options.id = process.argv[2];
    run();
} else {
    console.log('usage: >node video_test [video_id]');
}