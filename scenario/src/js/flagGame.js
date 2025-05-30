function setFlagDifficulty(level, context) {
    context.session = context.session || {};
    context.session.difficulty = level;
    context.session.score = 0;
    context.session.used = [];
    context.session.countries = getCountriesByDifficulty(level);
}

function startFlagGame(context) {
    context.session = context.session || {};
    context.session.score = 0;
    context.session.used = [];
    askNextFlag(context);
}

function askNextFlag(context) {
    var countries = context.session.countries || [];
    var used = context.session.used || [];
    var available = [];
    for (var i = 0; i < countries.length; i++) {
        if (used.indexOf(countries[i].name) === -1) {
            available.push(countries[i]);
        }
    }
    if (available.length === 0) {
        context.flagUrl = '';
        context.session.currentFlag = null;
        return;
    }
    var next = available[Math.floor(Math.random() * available.length)];
    context.session.currentFlag = next;
    context.session.used.push(next.name);
    context.flagUrl = next.flag;
}

function checkFlagAnswer(answer, context) {
    var current = context.session.currentFlag;
    var correct = false;
    if (current) {
        var userAnswer = String(answer).replace(/^	+|\s+$/g, '').toLowerCase();
        correct = userAnswer === current.russianName || userAnswer === current.name;
    }
    context.isCorrect = correct;
    if (correct) {
        context.session.score = (context.session.score || 0) + 1;
        askNextFlag(context);
    }
}

function restartFlagGame(context) {
    var level = (context.session && context.session.difficulty) || 'easy';
    setFlagDifficulty(level, context);
    startFlagGame(context);
}

function getCountriesByDifficulty(difficulty) {
    var easy = [
        { name: 'russia', russianName: 'россия', flag: 'https://flagcdn.com/w320/ru.png' },
        { name: 'usa', russianName: 'сша', flag: 'https://flagcdn.com/w320/us.png' },
        { name: 'china', russianName: 'китай', flag: 'https://flagcdn.com/w320/cn.png' },
        { name: 'germany', russianName: 'германия', flag: 'https://flagcdn.com/w320/de.png' },
        { name: 'united kingdom', russianName: 'великобритания', flag: 'https://flagcdn.com/w320/gb.png' },
        { name: 'france', russianName: 'франция', flag: 'https://flagcdn.com/w320/fr.png' },
        { name: 'italy', russianName: 'италия', flag: 'https://flagcdn.com/w320/it.png' },
        { name: 'japan', russianName: 'япония', flag: 'https://flagcdn.com/w320/jp.png' },
        { name: 'spain', russianName: 'испания', flag: 'https://flagcdn.com/w320/es.png' },
        { name: 'canada', russianName: 'канада', flag: 'https://flagcdn.com/w320/ca.png' },
        { name: 'australia', russianName: 'австралия', flag: 'https://flagcdn.com/w320/au.png' },
        { name: 'brazil', russianName: 'бразилия', flag: 'https://flagcdn.com/w320/br.png' },
        { name: 'india', russianName: 'индия', flag: 'https://flagcdn.com/w320/in.png' },
        { name: 'mexico', russianName: 'мексика', flag: 'https://flagcdn.com/w320/mx.png' },
        { name: 'south korea', russianName: 'южная корея', flag: 'https://flagcdn.com/w320/kr.png' },
        { name: 'netherlands', russianName: 'нидерланды', flag: 'https://flagcdn.com/w320/nl.png' },
        { name: 'turkey', russianName: 'турция', flag: 'https://flagcdn.com/w320/tr.png' },
        { name: 'switzerland', russianName: 'швейцария', flag: 'https://flagcdn.com/w320/ch.png' },
        { name: 'sweden', russianName: 'швеция', flag: 'https://flagcdn.com/w320/se.png' },
        { name: 'poland', russianName: 'польша', flag: 'https://flagcdn.com/w320/pl.png' },
        { name: 'belgium', russianName: 'бельгия', flag: 'https://flagcdn.com/w320/be.png' },
        { name: 'norway', russianName: 'норвегия', flag: 'https://flagcdn.com/w320/no.png' },
        { name: 'austria', russianName: 'австрия', flag: 'https://flagcdn.com/w320/at.png' },
        { name: 'denmark', russianName: 'дания', flag: 'https://flagcdn.com/w320/dk.png' },
        { name: 'finland', russianName: 'финляндия', flag: 'https://flagcdn.com/w320/fi.png' },
        { name: 'greece', russianName: 'греция', flag: 'https://flagcdn.com/w320/gr.png' },
        { name: 'portugal', russianName: 'португалия', flag: 'https://flagcdn.com/w320/pt.png' },
        { name: 'ireland', russianName: 'ирландия', flag: 'https://flagcdn.com/w320/ie.png' },
        { name: 'new zealand', russianName: 'новая зеландия', flag: 'https://flagcdn.com/w320/nz.png' },
        { name: 'egypt', russianName: 'египет', flag: 'https://flagcdn.com/w320/eg.png' }
    ];
    var medium = [
        { name: 'argentina', russianName: 'аргентина', flag: 'https://flagcdn.com/w320/ar.png' },
        { name: 'thailand', russianName: 'таиланд', flag: 'https://flagcdn.com/w320/th.png' },
        { name: 'south africa', russianName: 'южная африка', flag: 'https://flagcdn.com/w320/za.png' },
        { name: 'vietnam', russianName: 'вьетнам', flag: 'https://flagcdn.com/w320/vn.png' },
        { name: 'croatia', russianName: 'хорватия', flag: 'https://flagcdn.com/w320/hr.png' },
        { name: 'czechia', russianName: 'чехия', flag: 'https://flagcdn.com/w320/cz.png' },
        { name: 'colombia', russianName: 'колумбия', flag: 'https://flagcdn.com/w320/co.png' },
        { name: 'chile', russianName: 'чили', flag: 'https://flagcdn.com/w320/cl.png' },
        { name: 'hungary', russianName: 'венгрия', flag: 'https://flagcdn.com/w320/hu.png' },
        { name: 'morocco', russianName: 'марокко', flag: 'https://flagcdn.com/w320/ma.png' },
        { name: 'peru', russianName: 'перу', flag: 'https://flagcdn.com/w320/pe.png' },
        { name: 'philippines', russianName: 'филиппины', flag: 'https://flagcdn.com/w320/ph.png' },
        { name: 'romania', russianName: 'румыния', flag: 'https://flagcdn.com/w320/ro.png' },
        { name: 'slovakia', russianName: 'словакия', flag: 'https://flagcdn.com/w320/sk.png' },
        { name: 'ukraine', russianName: 'украина', flag: 'https://flagcdn.com/w320/ua.png' },
        { name: 'algeria', russianName: 'алжир', flag: 'https://flagcdn.com/w320/dz.png' },
        { name: 'tunisia', russianName: 'тунис', flag: 'https://flagcdn.com/w320/tn.png' },
        { name: 'bulgaria', russianName: 'болгария', flag: 'https://flagcdn.com/w320/bg.png' },
        { name: 'ecuador', russianName: 'эквадор', flag: 'https://flagcdn.com/w320/ec.png' },
        { name: 'iceland', russianName: 'исландия', flag: 'https://flagcdn.com/w320/is.png' },
        { name: 'serbia', russianName: 'сербия', flag: 'https://flagcdn.com/w320/rs.png' },
        { name: 'slovenia', russianName: 'словения', flag: 'https://flagcdn.com/w320/si.png' },
        { name: 'uruguay', russianName: 'уругвай', flag: 'https://flagcdn.com/w320/uy.png' },
        { name: 'singapore', russianName: 'сингапур', flag: 'https://flagcdn.com/w320/sg.png' },
        { name: 'malaysia', russianName: 'малайзия', flag: 'https://flagcdn.com/w320/my.png' },
        { name: 'estonia', russianName: 'эстония', flag: 'https://flagcdn.com/w320/ee.png' },
        { name: 'latvia', russianName: 'латвия', flag: 'https://flagcdn.com/w320/lv.png' },
        { name: 'lithuania', russianName: 'литва', flag: 'https://flagcdn.com/w320/lt.png' },
        { name: 'luxembourg', russianName: 'люксембург', flag: 'https://flagcdn.com/w320/lu.png' },
        { name: 'cyprus', russianName: 'кипр', flag: 'https://flagcdn.com/w320/cy.png' }
    ];
    var hard = [
        { name: 'andorra', russianName: 'андорра', flag: 'https://flagcdn.com/w320/ad.png' },
        { name: 'armenia', russianName: 'армения', flag: 'https://flagcdn.com/w320/am.png' },
        { name: 'azerbaijan', russianName: 'азербайджан', flag: 'https://flagcdn.com/w320/az.png' },
        { name: 'bahamas', russianName: 'багамы', flag: 'https://flagcdn.com/w320/bs.png' },
        { name: 'bahrain', russianName: 'бахрейн', flag: 'https://flagcdn.com/w320/bh.png' },
        { name: 'bangladesh', russianName: 'бангладеш', flag: 'https://flagcdn.com/w320/bd.png' },
        { name: 'barbados', russianName: 'барбадос', flag: 'https://flagcdn.com/w320/bb.png' },
        { name: 'belarus', russianName: 'беларусь', flag: 'https://flagcdn.com/w320/by.png' },
        { name: 'belize', russianName: 'белиз', flag: 'https://flagcdn.com/w320/bz.png' },
        { name: 'benin', russianName: 'бенин', flag: 'https://flagcdn.com/w320/bj.png' },
        { name: 'bhutan', russianName: 'бутан', flag: 'https://flagcdn.com/w320/bt.png' },
        { name: 'bolivia', russianName: 'боливия', flag: 'https://flagcdn.com/w320/bo.png' },
        { name: 'bosnia and herzegovina', russianName: 'босния и герцеговина', flag: 'https://flagcdn.com/w320/ba.png' },
        { name: 'botswana', russianName: 'ботсвана', flag: 'https://flagcdn.com/w320/bw.png' },
        { name: 'brunei', russianName: 'бруней', flag: 'https://flagcdn.com/w320/bn.png' },
        { name: 'burkina faso', russianName: 'буркина-фасо', flag: 'https://flagcdn.com/w320/bf.png' },
        { name: 'burundi', russianName: 'бурунди', flag: 'https://flagcdn.com/w320/bi.png' },
        { name: 'cambodia', russianName: 'камбоджа', flag: 'https://flagcdn.com/w320/kh.png' },
        { name: 'cameroon', russianName: 'камбоджа', flag: 'https://flagcdn.com/w320/cm.png' },
        { name: 'cape verde', russianName: 'кабо-верде', flag: 'https://flagcdn.com/w320/cv.png' }
        // ... добавьте остальные страны по аналогии ...
    ];
    if (difficulty === 'easy') return easy;
    if (difficulty === 'medium') return medium;
    if (difficulty === 'hard') return hard;
    return easy;
}

function showFlag(flagUrl) {
    if (typeof document !== 'undefined') {
        var flagImg = document.getElementById('flag');
        if (flagImg && flagUrl) {
            flagImg.src = flagUrl;
        }
    }
} 