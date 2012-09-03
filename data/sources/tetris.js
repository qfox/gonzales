Tetris = (function() {



var scale = 24;

var width = 10;

var height = 20;



var speed = 1000;



var $ = function(id) {return document.getElementById(id)};

var dc = function(tag) {return document.createElement(tag)};



var levels = [

	{p:500, s:1000, bg:"sun.jpg"},

	{p:1000, s:700, bg:"mercury.jpg"},

	{p:2000, s:500, bg:"venus.jpg"},

	{p:5000, s:400, bg:"earth.jpg"},

	{p:10000, s:300, bg:"mars.jpg"},

	{p:25000, s:200, bg:"jupiter.jpg"},

	{p:50000, s:150, bg:"saturn.jpg"},

	{p:100000, s:100, bg:"uranus.jpg"},

	{p:250000, s:75, bg:"neptune.jpg"}

];



var game;

var paused = false;

var running = false;

var activePiece;

var activePieceType = -1;

var nextPieceType = -1;

var activeRot = 0;

var field = [];

var fieldRows = [];

var level = 0;

var score = 0;



var lineScore = [30,120,270,520];

var lines = 0;



var curX = 0;

var curY = 0;

var timer = 0;





function init() {

	game = $("gamefield");



	updateGameInfo();



	registerEvents();



	if (location.search) {

		loadGame(decodeURIComponent(location.search.substring(1)));

	} else {

		splash();

	}

}



function clearField() {

	game.innerHTML = "";

	fieldRows = [];

	for (var y=0;y<height;y++) {

		var row = dc("div");

		row.style.position = "absolute";

		row.style.top = y*scale+"px";

		row.style.left = "0px";

		row.style.width = width*scale+"px";

		row.style.height = scale+"px";

		fieldRows[y] = row;

		game.appendChild(row);



		field[y] = [];

		for (var x=0;x<width;x++) {

			field[y][x] = 0;

		}

	}

}



function splash() {

}



function registerEvents() {

	addEvent(document, "keydown", onKeyDown);

}



function addEvent(el, event, handler) {

	if (el.addEventListener)

		el.addEventListener(event, handler, false); 

	else if (el.attachEvent)

		el.attachEvent("on" + event, handler); 

}



function onKeyDown(e) {

	e = e || window.event;

	var keyCode = e.which || e.keyCode;

//console.log(keyCode);

	switch (keyCode) {

		case 13: // enter

			dropPiece();

			break;

		case 32: // space

			if (!running) {

				startGame();

				return;

			}

		case 38: // up

			rotateActivePiece();

			break;

		case 39: // left

			moveActivePiece(1, 0);

			break;

		case 37: // right

			moveActivePiece(-1, 0);

			break;

		case 40: // down

			moveActivePiece(0, 1);

			break;

		case 83 :

			saveGame();

			break;

		/*

		case 76:

			loadGame("{f:\"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000033300000000300000\",p:{x:3,y:1,r:0,t:1}}");

			break;

		*/

		case 80:

			togglePause();

		default : 

			return false;

	}

	if (e.preventDefault)

		e.preventDefault();

	return true;

}



function dropPiece() {

	for (var y=0;y<height;y++) {

		if (!moveActivePiece(0, 1))

			break;

	}

}



function menu() {

}







function startGame() {

	speed = levels[level].s;

	clearField();

	updateGameInfo();



	//createPiece();

	running = true;

	nextCycle();

}



function cycle() {

	if (running) {

		if (!paused) {

			if (!activePiece) {

				activePieceType = nextPieceType > -1 ? nextPieceType : Math.floor(Math.random() * basePieces.length);

				activePiece = createPiece(activePieceType);

				activeRot = 0;

				curX = Math.floor(width/2-2);

				curY = 0;

				rebuildPiece(activePiece, activePieceType, activeRot);

				game.appendChild(activePiece);

	

				if (!canMoveTo(curX, curY)) {

					gameOver();

					return;

				}



				nextPieceType = Math.floor(Math.random() * basePieces.length);

				updateNextPiece();

				moveActivePiece(0,0);

			} else {

				moveActivePiece(0,1);

			}

		}

		nextCycle();

	}

}



function nextCycle() {

	clearTimeout(timer);

	timer = setTimeout(cycle, speed);

}



function togglePause() {

	paused = !paused;

	if (paused) {

		// show pause text

	} else {

		// hide pause text

	}

}



function gameOver() {

	running = false;

	activePiece = null;

}



function rotateActivePiece() {

	if (!activePiece) return;

	if (paused || !running) return;



	activeRot++;

	if (activeRot > 3) activeRot = 0;

	if (canMoveTo(curX, curY)) {

		rebuildPiece(activePiece, activePieceType, activeRot);

	} else {

		activeRot--;

		if (activeRot < 0) activeRot = 3;

	}

}



function moveActivePiece(addX, addY) {

	if (!activePiece) return;

	if (paused || !running) return;



	var newX = curX + addX;

	var newY = curY + addY;

	if (canMoveTo(newX, newY)) {

		curX = newX;

		curY = newY;

		activePiece.style.left = curX*scale+"px";

		activePiece.style.top = curY*scale+"px";

		return true;

	} else {

		if (addY > 0) { // moving down

			landPiece();

			activePiece = null;

		}

	}

	return false;

}



function landPiece() {

	var pieceDesc = basePieces[activePieceType];

	for (var i=0;i<pieceDesc.length;i++) {

		for (var j=0;j<pieceDesc.length;j++) {

			(function() {

			if (pieceDesc[i][j]) {

				var px = rotateX(j,i,pieceDesc.length,activeRot);

				var py = rotateY(j,i,pieceDesc.length,activeRot);

				var block = activePiece.blocks[py][px];

				activePiece.removeChild(block);

				fieldRows[curY+py].appendChild(block)

				block.style.left = (curX+px)*scale+"px";

				block.style.top = "0px";

				field[curY + py][curX + px] = activePieceType+1;

			}

			})();

		}

	}

	game.removeChild(activePiece);

	setTimeout(checkRows, 50);

	nextCycle();

}



function checkRows() {

	var fullRows = [];

	for (var y=0;y<height;y++) {

		var rowFull = true;

		for (var x=0;x<width;x++) {

			if (!field[y][x])

				rowFull = false;

		}

		if (rowFull) {

			fullRows.push(y);

		}

	}



	if (fullRows.length) {

		score += lineScore[fullRows.length-1]*(level+1);

		lines += fullRows.length;

		updateGameInfo();

		checkLevel();

	}



	for (var i=0;i<fullRows.length;i++) {

		var copyField = [];

		var copyRows = [];

		for (var y=0;y<height;y++) {

			copyField[y] = [];

			copyRows[y] = fieldRows[y].innerHTML;

			for (var x=0;x<width;x++) {

				copyField[y][x] = field[y][x];

			}

		}



		fieldRows[fullRows[i]].innerHTML = "";

		for (var y=fullRows[i];y>=0;y--) {

			fieldRows[y].innerHTML = copyRows[y-1]||"";

			for (var x=0;x<width;x++) {

				field[y][x] = y > 0 ? copyField[y-1][x] : 0;

			}

		}

	}

	

}



function updateGameInfo() {

	$("tetris-score-text").innerHTML = "Score: " + score;

	$("tetris-lines-text").innerHTML = "Lines: " + lines;

	$("tetris-level-text").innerHTML = "Level: " + (level+1);

}



function checkLevel() {

	if (levels[level]) {

		if (score >= levels[level].p) {

			level++;

			speed = levels[level].s;

			updateGameInfo();

		}

	}

}



function canMoveTo(x,y) {

	var pieceDesc = basePieces[activePieceType];

	for (var i=0;i<pieceDesc.length;i++) {

		for (var j=0;j<pieceDesc.length;j++) {

			if (pieceDesc[i][j]) {

				var px = rotateX(j,i,pieceDesc.length,activeRot);

				var py = rotateY(j,i,pieceDesc.length,activeRot);

				if (isBlocked(x+px, y+py))

					return false;

			}

		}

	}

	return true;

}



function isBlocked(x,y) {

	if (x < 0 || y < 0) return true;

	if (x >= width || y >= height) return true;

	return field[y][x];

}



function nextLevel() {

}



var basePieces = [

	[

		[0,1,0,0],	// I

		[0,1,0,0],

		[0,1,0,0],

		[0,1,0,0]

	],

	[

		[0,0,1],	// J

		[0,0,1],

		[0,1,1]

	],

	[

		[1,1,1],	// T

		[0,1,0],

		[0,0,0]

	],

	[

		[1,0,0],	// L

		[1,0,0],

		[1,1,0]

	],

	[

		[1,1],		// O

		[1,1]

	],

	[

		[0,1,1],	// Z

		[1,1,0],

		[0,0,0]

	],

	[

		[1,1,0],	// S

		[0,1,1],

		[0,0,0]

	]

];



var pieceColors = ["#00f0f0", "#0000f0", "#a000f0", "#f0a000", "#f0f000", "#f00000", "#00f000"];



function createPiece(pieceType) {







	var pieceDesc = basePieces[pieceType];



	var div = dc("div");

	div.style.position = "absolute";

	div.style.top = curY*scale + "px";

	div.style.left = curX*scale + "px";

	div.style.width = pieceDesc.length*scale + "px";

	div.style.height = pieceDesc.length*scale + "px";



	return div;

}



function updateNextPiece() {

	var div = $("tetris-next-piece");

	div.innerHTML = "";

	var piece = createPiece(nextPieceType);

	var rot = 0;

	piece.style.left = "48px";

	piece.style.top = "24px";

	switch (nextPieceType) {

		case 0:

			rot = 1;

			piece.style.top = "0px";

			break;

		case 2:

			rot = 3;

			break;

		case 3:

		case 4:

			piece.style.left = "72px";

			break;

		case 5:

		case 6:

			rot = 1;

			piece.style.left = "72px";

			break;

		default:

	}

	rebuildPiece(piece, nextPieceType, rot);

	div.appendChild(piece);

}



function rebuildPiece(div, pieceType, rot) {

	div.innerHTML = "";

	var pieceDesc = basePieces[pieceType];

	div.blocks = [];

	for (var i=0;i<pieceDesc.length;i++)

		div.blocks[i] = [];

	for (var i=0;i<pieceDesc.length;i++) {

		for (var j=0;j<pieceDesc.length;j++) {

			if (pieceDesc[i][j]) {

				var px = rotateX(j,i,pieceDesc.length, rot);

				var py = rotateY(j,i,pieceDesc.length, rot);

				var block = createBlock(pieceColors[pieceType],px,py,pieceDesc.length);

				div.appendChild(block);

				div.blocks[py][px] = block;

			}

		}

	}

}



function rotateX(j,i,size, rot) {

	switch (rot) {

		case 0:

			var px = j; break;

		case 1:

			var px = i; break;

		case 2:

			var px = (size-1)-j; break;

		case 3:

			var px = (size-1)-i; break;

	}

	return px;

}



function rotateY(j,i,size, rot) {

	switch (rot) {

		case 0:

			var py = i; break;

		case 1:

			var py = (size-1)-j; break;

		case 2:

			var py = (size-1)-i; break;

		case 3:

			var py = j;break;

	}

	return py;

}





function createBlock(color,x,y) {

	var div = dc("div");

	div.className = "tetris-block";

	div.style.backgroundColor = color;

	div.style.borderColor = color;



	div.style.left = x*scale + "px";

	div.style.top = y*scale + "px";



	return div;

}



function serialize() {

	var fieldString = "\"";

	for (var y=0;y<height;y++) {

		for (var x=0;x<width;x++) {

			fieldString += field[y][x];

		}

	}

	fieldString += "\"";



	var pieceString  = "{"

		+ "x:"+curX+",y:"+curY+",r:"+activeRot+",t:"+activePieceType

	+ "}";



	var gameString = "{"

		+ "f:" + fieldString + ","

		+ "p:" + pieceString + ","

		+ "n:" + nextPieceType + ","

		+ "s:" + score + ","

		+ "v:" + level + ","

		+ "l:" + lines

	+ "}";

	return gameString;

}



function loadGame(gameString) {

	clearField();

	// TODO: Fix this.

	var oldGame = eval("("+gameString+")");

	var f = oldGame.f.split("");

	var p = oldGame.p;

	for (var y=0;y<height;y++) {

		for (var x=0;x<width;x++) {

			field[y][x] = parseInt(f.shift(),10);

			if (field[y][x]) {

				var block = createBlock(pieceColors[field[y][x]-1],x,0);

				fieldRows[y].appendChild(block);

			}

		}

	}



	activeRot = p.r;

	curX = p.x;

	curY = p.y;

	activePieceType = p.t;



	nextPieceType = oldGame.n;

	score = oldGame.s;

	level = oldGame.v;

	lines = oldGame.l;

	speed = levels[level].s;



	updateGameInfo();

	updateNextPiece();



	activePiece = createPiece(activePieceType);

	rebuildPiece(activePiece, activePieceType, activeRot);

	curY = p.y;

	curX = p.x;



	activePiece.style.top = curY*scale + "px";

	activePiece.style.left = curX*scale + "px";

	game.appendChild(activePiece);





	if (!running) {

		running = true;

		nextCycle();

	}

}



window.__json_callbacks = {};

var jsonCallCount = 0;



function callJSON(url, callback) {

	jsonCallCount++;

	var script = document.createElement("script");

	window.__json_callbacks["fn_" + jsonCallCount] = function(response) {

		document.body.removeChild(script);

		if (callback)

			callback(response);

	}

	script.setAttribute("type", "text/javascript");

	document.body.appendChild(script);

	script.src = url + "&callback=__json_callbacks.fn_" + jsonCallCount;

}



function saveGame() {

	if (!running) return;



	var wasPaused = paused;

	paused = true;

	var gameString = serialize();

	var url = "http://www.nihilogic.dk/labs/tetris/?" + encodeURIComponent(gameString);

	callJSON(

		"http://json-tinyurl.appspot.com/?url=" + encodeURIComponent(url),

		function(res) {

			if (res.ok) {

				prompt("Your game has been saved. Go to this URL to load the game whenever you please:", res.tinyurl);

			} else {

				alert("Oops. Something went wrong when trying to save the game!");

			}

			paused = wasPaused;

		}

	);

}





return init;



})();



Tetris();



var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));



(function(){var aa="_gat",ba="_gaq",r=true,v=false,w=undefined,ca="4.6.5",x="length",y="cookie",A="location",B="&",C="=",D="__utma=",E="__utmb=",G="__utmc=",da="__utmk=",H="__utmv=",J="__utmz=",K="__utmx=",L="GASO=";var N=function(i){return w==i||"-"==i||""==i},ea=function(i){return i[x]>0&&" \n\r\t".indexOf(i)>-1},P=function(i,l,g){var t="-",k;if(!N(i)&&!N(l)&&!N(g)){k=i.indexOf(l);if(k>-1){g=i.indexOf(g,k);if(g<0)g=i[x];t=O(i,k+l.indexOf(C)+1,g)}}return t},Q=function(i){var l=v,g=0,t,k;if(!N(i)){l=r;for(t=0;t<i[x];t++){k=i.charAt(t);g+="."==k?1:0;l=l&&g<=1&&(0==t&&"-"==k||".0123456789".indexOf(k)>-1)}}return l},S=function(i,l){var g=encodeURIComponent;return g instanceof Function?l?encodeURI(i):g(i):escape(i)},
T=function(i,l){var g=decodeURIComponent,t;i=i.split("+").join(" ");if(g instanceof Function)try{t=l?decodeURI(i):g(i)}catch(k){t=unescape(i)}else t=unescape(i);return t},U=function(i,l){return i.indexOf(l)>-1},V=function(i,l){i[i[x]]=l},W=function(i){return i.toLowerCase()},X=function(i,l){return i.split(l)},fa=function(i,l){return i.indexOf(l)},O=function(i,l,g){g=w==g?i[x]:g;return i.substring(l,g)},ga=function(i,l){return i.join(l)},ia=function(i){var l=1,g=0,t;if(!N(i)){l=0;for(t=i[x]-1;t>=0;t--){g=
i.charCodeAt(t);l=(l<<6&268435455)+g+(g<<14);g=l&266338304;l=g!=0?l^g>>21:l}}return l},ja=function(){var i=window,l=w;if(i&&i.gaGlobal&&i.gaGlobal.hid)l=i.gaGlobal.hid;else{l=Y();i.gaGlobal=i.gaGlobal?i.gaGlobal:{};i.gaGlobal.hid=l}return l},Y=function(){return Math.round(Math.random()*2147483647)},Z={Ha:function(i,l){this.bb=i;this.nb=l},ib:v,_gasoDomain:w,_gasoCPath:w};Z.Gb=function(){function i(k){return new t(k[0],k[1])}function l(k){var p=[];k=k.split(",");var f;for(f=0;f<k.length;++f)p.push(i(k[f].split(":")));return p}var g=this,t=Z.Ha;g.Ia="utm_campaign";g.Ja="utm_content";g.Ka="utm_id";g.La="utm_medium";g.Ma="utm_nooverride";g.Na="utm_source";g.Oa="utm_term";g.Pa="gclid";g.ba=0;g.z=0;g.Ta=15768E6;g.sb=18E5;g.v=63072E6;g.ta=[];g.va=[];g.nc="cse";g.oc="q";g.ob=5;g.T=l("daum:q,eniro:search_word,naver:query,images.google:q,google:q,yahoo:p,msn:q,bing:q,aol:query,aol:encquery,lycos:query,ask:q,altavista:q,netscape:query,cnn:query,about:terms,mamma:query,alltheweb:q,voila:rdata,virgilio:qs,live:q,baidu:wd,alice:qs,yandex:text,najdi:q,aol:q,mama:query,seznam:q,search:q,wp:szukaj,onet:qt,szukacz:q,yam:k,pchome:q,kvasir:q,sesam:q,ozu:q,terra:query,mynet:q,ekolay:q,rambler:words");
g.t=w;g.lb=v;g.h="/";g.U=100;g.oa="/__utm.gif";g.ga=1;g.ha=1;g.u="|";g.fa=1;g.da=1;g.Ra=1;g.b="auto";g.I=1;g.ra=1E3;g.Jc=10;g.Pb=10;g.Kc=0.2;g.o=w;g.a=document;g.e=window};Z.Hb=function(i){function l(d,a,j,c){var n="",s=0;n=P(d,"2"+a,";");if(!N(n)){d=n.indexOf("^"+j+".");if(d<0)return["",0];n=O(n,d+j[x]+2);if(n.indexOf("^")>0)n=n.split("^")[0];j=n.split(":");n=j[1];s=parseInt(j[0],10);if(!c&&s<p.r)n=""}if(N(n))n="";return[n,s]}function g(d,a){return"^"+ga([[a,d[1]].join("."),d[0]],":")}function t(d,a){f.a[y]=d+"; path="+f.h+"; "+a+p.fb()}function k(d){var a=new Date;d=new Date(a.getTime()+d);return"expires="+d.toGMTString()+"; "}var p=this,f=i;p.r=(new Date).getTime();
var h=[D,E,G,J,H,K,L];p.k=function(){var d=f.a[y];return f.o?p.Wb(d,f.o):d};p.Wb=function(d,a){var j=[],c,n;for(c=0;c<h[x];c++){n=l(d,h[c],a)[0];N(n)||(j[j[x]]=h[c]+n+";")}return j.join("")};p.l=function(d,a,j){var c=j>0?k(j):"";if(f.o){a=p.kc(f.a[y],d,f.o,a,j);d="2"+d;c=j>0?k(f.v):""}t(d+a,c)};p.kc=function(d,a,j,c,n){var s="";n=n||f.v;c=g([c,p.r+n*1],j);s=P(d,"2"+a,";");if(!N(s)){d=g(l(d,a,j,r),j);s=ga(s.split(d),"");return s=c+s}return c};p.fb=function(){return N(f.b)?"":"domain="+f.b+";"}};Z.$=function(i){function l(b){b=b instanceof Array?b.join("."):"";return N(b)?"-":b}function g(b,e){var o=[];if(!N(b)){o=b.split(".");if(e)for(b=0;b<o[x];b++)Q(o[b])||(o[b]="-")}return o}function t(b,e,o){var m=c.M,q,u;for(q=0;q<m[x];q++){u=m[q][0];u+=N(e)?e:e+m[q][4];m[q][2](P(b,u,o))}}var k,p,f,h,d,a,j,c=this,n,s=i;c.j=new Z.Hb(i);c.kb=function(){return w==n||n==c.P()};c.k=function(){return c.j.k()};c.ma=function(){return d?d:"-"};c.vb=function(b){d=b};c.za=function(b){n=Q(b)?b*1:"-"};c.la=function(){return l(a)};
c.Aa=function(b){a=g(b)};c.Vb=function(){c.j.l(H,"",-1)};c.lc=function(){return n?n:"-"};c.fb=function(){return N(s.b)?"":"domain="+s.b+";"};c.ja=function(){return l(k)};c.tb=function(b){k=g(b,1)};c.C=function(){return l(p)};c.ya=function(b){p=g(b,1)};c.ka=function(){return l(f)};c.ub=function(b){f=g(b,1)};c.na=function(){return l(h)};c.wb=function(b){h=g(b);for(b=0;b<h[x];b++)if(b<4&&!Q(h[b]))h[b]="-"};c.fc=function(){return j};c.Dc=function(b){j=b};c.Sb=function(){k=[];p=[];f=[];h=[];d=w;a=[];n=
w};c.P=function(){var b="",e;for(e=0;e<c.M[x];e++)b+=c.M[e][1]();return ia(b)};c.ua=function(b){var e=c.k(),o=v;if(e){t(e,b,";");c.za(c.P());o=r}return o};c.zc=function(b){t(b,"",B);c.za(P(b,da,B))};c.Hc=function(){var b=c.M,e=[],o;for(o=0;o<b[x];o++)V(e,b[o][0]+b[o][1]());V(e,da+c.P());return e.join(B)};c.Nc=function(b,e){var o=c.M,m=s.h;c.ua(b);s.h=e;for(b=0;b<o[x];b++)N(o[b][1]())||o[b][3]();s.h=m};c.Cb=function(){c.j.l(D,c.ja(),s.v)};c.Ea=function(){c.j.l(E,c.C(),s.sb)};c.Db=function(){c.j.l(G,
c.ka(),0)};c.Ga=function(){c.j.l(J,c.na(),s.Ta)};c.Eb=function(){c.j.l(K,c.ma(),s.v)};c.Fa=function(){c.j.l(H,c.la(),s.v)};c.Oc=function(){c.j.l(L,c.fc(),0)};c.M=[[D,c.ja,c.tb,c.Cb,"."],[E,c.C,c.ya,c.Ea,""],[G,c.ka,c.ub,c.Db,""],[K,c.ma,c.vb,c.Eb,""],[J,c.na,c.wb,c.Ga,"."],[H,c.la,c.Aa,c.Fa,"."]]};Z.Kb=function(i){var l=this,g=i,t=new Z.$(g),k=function(){},p=function(f){var h=(new Date).getTime(),d;d=(h-f[3])*(g.Kc/1E3);if(d>=1){f[2]=Math.min(Math.floor(f[2]*1+d),g.Pb);f[3]=h}return f};l.H=function(f,h,d,a,j,c){var n,s=g.I,b=g.a[A];t.ua(d);n=X(t.C(),".");if(n[1]<500||a){if(j)n=p(n);if(a||!j||n[2]>=1){if(!a&&j)n[2]=n[2]*1-1;n[1]=n[1]*1+1;f="?utmwv="+ca+"&utmn="+Y()+(N(b.hostname)?"":"&utmhn="+S(b.hostname))+(g.U==100?"":"&utmsp="+S(g.U))+f;if(0==s||2==s){a=2==s?k:c||k;l.$a(g.oa+f,a)}if(1==s||
2==s){f=("https:"==b.protocol?"https://ssl.google-analytics.com/__utm.gif":"http://www.google-analytics.com/__utm.gif")+f+"&utmac="+h+"&utmcc="+l.ac(d);if(ka)f+="&gaq=1";l.$a(f,c)}}}t.ya(n.join("."));t.Ea()};l.$a=function(f,h){var d=new Image(1,1);d.src=f;d.onload=function(){d.onload=null;(h||k)()}};l.ac=function(f){var h=[],d=[D,J,H,K],a,j=t.k(),c;for(a=0;a<d[x];a++){c=P(j,d[a]+f,";");if(!N(c)){if(d[a]==H){c=X(c.split(f+".")[1],"|")[0];if(N(c))continue;c=f+"."+c}V(h,d[a]+c+";")}}return S(h.join("+"))}};Z.n=function(){var i=this;i.Y=[];i.hb=function(l){var g,t=i.Y,k;for(k=0;k<t.length;k++)g=l==t[k].q?t[k]:g;return g};i.Ob=function(l,g,t,k,p,f,h,d){var a=i.hb(l);if(w==a){a=new Z.n.Mb(l,g,t,k,p,f,h,d);V(i.Y,a)}else{a.Qa=g;a.Ab=t;a.zb=k;a.xb=p;a.Xa=f;a.yb=h;a.Za=d}return a}};Z.n.Lb=function(i,l,g,t,k,p){var f=this;f.Bb=i;f.Ba=l;f.D=g;f.Va=t;f.pb=k;f.qb=p;f.Ca=function(){return"&"+["utmt=item","tid="+S(f.Bb),"ipc="+S(f.Ba),"ipn="+S(f.D),"iva="+S(f.Va),"ipr="+S(f.pb),"iqt="+S(f.qb)].join("&utm")}};
Z.n.Mb=function(i,l,g,t,k,p,f,h){var d=this;d.q=i;d.Qa=l;d.Ab=g;d.zb=t;d.xb=k;d.Xa=p;d.yb=f;d.Za=h;d.R=[];d.Nb=function(a,j,c,n,s){var b=d.gc(a),e=d.q;if(w==b)V(d.R,new Z.n.Lb(e,a,j,c,n,s));else{b.Bb=e;b.Ba=a;b.D=j;b.Va=c;b.pb=n;b.qb=s}};d.gc=function(a){var j,c=d.R,n;for(n=0;n<c.length;n++)j=a==c[n].Ba?c[n]:j;return j};d.Ca=function(){return"&"+["utmt=tran","id="+S(d.q),"st="+S(d.Qa),"to="+S(d.Ab),"tx="+S(d.zb),"sp="+S(d.xb),"ci="+S(d.Xa),"rg="+S(d.yb),"co="+S(d.Za)].join("&utmt")}};Z.Fb=function(i){function l(){var f,h,d;h="ShockwaveFlash";var a="$version",j=k.d?k.d.plugins:w;if(j&&j[x]>0)for(f=0;f<j[x]&&!d;f++){h=j[f];if(U(h.name,"Shockwave Flash"))d=h.description.split("Shockwave Flash ")[1]}else{h=h+"."+h;try{f=new ActiveXObject(h+".7");d=f.GetVariable(a)}catch(c){}if(!d)try{f=new ActiveXObject(h+".6");d="WIN 6,0,21,0";f.AllowScriptAccess="always";d=f.GetVariable(a)}catch(n){}if(!d)try{f=new ActiveXObject(h);d=f.GetVariable(a)}catch(s){}if(d){d=X(d.split(" ")[1],",");d=d[0]+
"."+d[1]+" r"+d[2]}}return d?d:p}var g=i,t=g.e,k=this,p="-";k.V=t.screen;k.Sa=!k.V&&t.java?java.awt.Toolkit.getDefaultToolkit():w;k.d=t.navigator;k.W=p;k.xa=p;k.Wa=p;k.qa=p;k.pa=1;k.eb=p;k.bc=function(){var f;if(t.screen){k.W=k.V.width+"x"+k.V.height;k.xa=k.V.colorDepth+"-bit"}else if(k.Sa)try{f=k.Sa.getScreenSize();k.W=f.width+"x"+f.height}catch(h){}k.qa=W(k.d&&k.d.language?k.d.language:k.d&&k.d.browserLanguage?k.d.browserLanguage:p);k.pa=k.d&&k.d.javaEnabled()?1:0;k.eb=g.ha?l():p;k.Wa=S(g.a.characterSet?
g.a.characterSet:g.a.charset?g.a.charset:p)};k.Ic=function(){return B+"utm"+["cs="+S(k.Wa),"sr="+k.W,"sc="+k.xa,"ul="+k.qa,"je="+k.pa,"fl="+S(k.eb)].join("&utm")};k.$b=function(){var f=g.a,h=t.history[x];f=k.d.appName+k.d.version+k.qa+k.d.platform+k.d.userAgent+k.pa+k.W+k.xa+(f[y]?f[y]:"")+(f.referrer?f.referrer:"");for(var d=f[x];h>0;)f+=h--^d++;return ia(f)}};Z.m=function(i,l,g,t){function k(d){var a="";d=W(d.split("://")[1]);if(U(d,"/")){d=d.split("/")[1];if(U(d,"?"))a=d.split("?")[0]}return a}function p(d){var a="";a=W(d.split("://")[1]);if(U(a,"/"))a=a.split("/")[0];return a}var f=t,h=this;h.c=i;h.rb=l;h.r=g;h.ic=function(d){var a=h.gb();return new Z.m.w(P(d,f.Ka+C,B),P(d,f.Na+C,B),P(d,f.Pa+C,B),h.Q(d,f.Ia,"(not set)"),h.Q(d,f.La,"(not set)"),h.Q(d,f.Oa,a&&!N(a.K)?T(a.K):w),h.Q(d,f.Ja,w))};h.jb=function(d){var a=p(d),j=k(d);if(U(a,"google")){d=d.split("?").join(B);
if(U(d,B+f.oc+C))if(j==f.nc)return r}return v};h.gb=function(){var d,a=h.rb,j,c,n=f.T;if(!(N(a)||"0"==a||!U(a,"://")||h.jb(a))){d=p(a);for(j=0;j<n[x];j++){c=n[j];if(U(d,W(c.bb))){a=a.split("?").join(B);if(U(a,B+c.nb+C)){d=a.split(B+c.nb+C)[1];if(U(d,B))d=d.split(B)[0];return new Z.m.w(w,c.bb,w,"(organic)","organic",d,w)}}}}};h.Q=function(d,a,j){d=P(d,a+C,B);return j=!N(d)?T(d):!N(j)?j:"-"};h.uc=function(d){var a=f.ta,j=v,c;if(d&&"organic"==d.S){d=W(T(d.K));for(c=0;c<a[x];c++)j=j||W(a[c])==d}return j};
h.hc=function(){var d="",a="";d=h.rb;if(!(N(d)||"0"==d||!U(d,"://")||h.jb(d))){d=d.split("://")[1];if(U(d,"/")){a=O(d,d.indexOf("/"));a=a.split("?")[0];d=W(d.split("/")[0])}if(0==d.indexOf("www."))d=O(d,4);return new Z.m.w(w,d,w,"(referral)","referral",w,a)}};h.Xb=function(d){var a="";if(f.ba){a=d&&d.hash?d.href.substring(d.href.indexOf("#")):"";a=""!=a?a+B:a}a+=d.search;return a};h.dc=function(){return new Z.m.w(w,"(direct)",w,"(direct)","(none)",w,w)};h.vc=function(d){var a=v,j,c=f.va;if(d&&"referral"==
d.S){d=W(S(d.X));for(j=0;j<c[x];j++)a=a||U(d,W(c[j]))}return a};h.L=function(d){return w!=d&&d.mb()};h.cc=function(d,a){var j="",c="-",n,s=0,b,e,o=h.c;if(!d)return"";e=d.k();j=h.Xb(f.a[A]);if(f.z&&d.kb()){c=d.na();if(!N(c)&&!U(c,";")){d.Ga();return""}}c=P(e,J+o+".",";");n=h.ic(j);if(h.L(n)){j=P(j,f.Ma+C,B);if("1"==j&&!N(c))return""}if(!h.L(n)){n=h.gb();if(!N(c)&&h.uc(n))return""}if(!h.L(n)&&a){n=h.hc();if(!N(c)&&h.vc(n))return""}if(!h.L(n))if(N(c)&&a)n=h.dc();if(!h.L(n))return"";if(!N(c)){s=c.split(".");
b=new Z.m.w;b.Zb(s.slice(4).join("."));b=W(b.Da())==W(n.Da());s=s[3]*1}if(!b||a){a=P(e,D+o+".",";");e=a.lastIndexOf(".");a=e>9?O(a,e+1)*1:0;s++;a=0==a?1:a;d.wb([o,h.r,a,s,n.Da()].join("."));d.Ga();return B+"utmcn=1"}else return B+"utmcr=1"}};
Z.m.w=function(i,l,g,t,k,p,f){var h=this;h.q=i;h.X=l;h.ea=g;h.D=t;h.S=k;h.K=p;h.Ya=f;h.Da=function(){var d=[],a=[["cid",h.q],["csr",h.X],["gclid",h.ea],["ccn",h.D],["cmd",h.S],["ctr",h.K],["cct",h.Ya]],j,c;if(h.mb())for(j=0;j<a[x];j++)if(!N(a[j][1])){c=a[j][1].split("+").join("%20");c=c.split(" ").join("%20");V(d,"utm"+a[j][0]+C+c)}return d.join("|")};h.mb=function(){return!(N(h.q)&&N(h.X)&&N(h.ea))};h.Zb=function(d){var a=function(j){return T(P(d,"utm"+j+C,"|"))};h.q=a("cid");h.X=a("csr");h.ea=a("gclid");
h.D=a("ccn");h.S=a("cmd");h.K=a("ctr");h.Ya=a("cct")}};Z.Ib=function(i,l,g,t){function k(j,c,n){var s;if(!N(n)){n=n.split(",");for(var b=0;b<n[x];b++){s=n[b];if(!N(s)){s=s.split(h);if(s[x]==4)c[s[0]]=[s[1],s[2],j]}}}}var p=this,f=l,h=C,d=i,a=t;p.O=g;p.sa="";p.p={};p.tc=function(){var j;j=X(P(p.O.k(),H+f+".",";"),f+".")[1];if(!N(j)){j=j.split("|");k(1,p.p,j[1]);p.sa=j[0];p.Z()}};p.Z=function(){p.Qb();var j=p.sa,c,n,s="";for(c in p.p)if((n=p.p[c])&&1===n[2])s+=c+h+n[0]+h+n[1]+h+1+",";N(s)||(j+="|"+s);if(N(j))p.O.Vb();else{p.O.Aa(f+"."+j);p.O.Fa()}};p.Ec=
function(j){p.sa=j;p.Z()};p.Cc=function(j,c,n,s){if(1!=s&&2!=s&&3!=s)s=3;var b=v;if(c&&n&&j>0&&j<=d.ob){c=S(c);n=S(n);if(c[x]+n[x]<=64){p.p[j]=[c,n,s];p.Z();b=r}}return b};p.mc=function(j){if((j=p.p[j])&&1===j[2])return j[1]};p.Ub=function(j){var c=p.p;if(c[j]){delete c[j];p.Z()}};p.Qb=function(){a._clearKey(8);a._clearKey(9);a._clearKey(11);var j=p.p,c,n;for(n in j)if(c=j[n]){a._setKey(8,n,c[0]);a._setKey(9,n,c[1]);(c=c[2])&&3!=c&&a._setKey(11,n,""+c)}}};Z.N=function(){function i(m,q,u,z){if(w==f[m])f[m]={};if(w==f[m][q])f[m][q]=[];f[m][q][u]=z}function l(m,q){if(w!=f[m]&&w!=f[m][q]){f[m][q]=w;q=r;var u;for(u=0;u<a[x];u++)if(w!=f[m][a[u]]){q=v;break}if(q)f[m]=w}}function g(m){var q="",u=v,z,M;for(z=0;z<a[x];z++){M=m[a[z]];if(w!=M){if(u)q+=a[z];q+=t(M);u=v}else u=r}return q}function t(m){var q=[],u,z;for(z=0;z<m[x];z++)if(w!=m[z]){u="";if(z!=o&&w==m[z-1])u+=z.toString()+s;u+=k(m[z]);V(q,u)}return j+q.join(n)+c}function k(m){var q="",u,z,M;for(u=0;u<
m[x];u++){z=m.charAt(u);M=e[z];q+=w!=M?M:z}return q}var p=this,f={},h="k",d="v",a=[h,d],j="(",c=")",n="*",s="!",b="'",e={};e[b]="'0";e[c]="'1";e[n]="'2";e[s]="'3";var o=1;p.qc=function(m){return w!=f[m]};p.G=function(){var m="",q;for(q in f)if(w!=f[q])m+=q.toString()+g(f[q]);return m};p.Ac=function(m){if(m==w)return p.G();var q=m.G(),u;for(u in f)if(w!=f[u]&&!m.qc(u))q+=u.toString()+g(f[u]);return q};p._setKey=function(m,q,u){if(typeof u!="string")return v;i(m,h,q,u);return r};p._setValue=function(m,
q,u){if(typeof u!="number"&&(w==Number||!(u instanceof Number))||Math.round(u)!=u||u==NaN||u==Infinity)return v;i(m,d,q,u.toString());return r};p._getKey=function(m,q){return w!=f[m]&&w!=f[m][h]?f[m][h][q]:w};p._getValue=function(m,q){return w!=f[m]&&w!=f[m][d]?f[m][d][q]:w};p._clearKey=function(m){l(m,h)};p._clearValue=function(m){l(m,d)}};Z.Jb=function(i,l){var g=this;g.Qc=l;g.xc=i;g._trackEvent=function(t,k,p){return l._trackEvent(g.xc,t,k,p)}};Z.aa=function(i,l){function g(){if("auto"==c.b){var b=c.a.domain;if("www."==O(b,0,4))b=O(b,4);c.b=b}c.b=W(c.b)}function t(){var b=c.b,e=b.indexOf("www.google.")*b.indexOf(".google.")*b.indexOf("google.");return e||"/"!=c.h||b.indexOf("google.org")>-1}function k(b,e,o){if(N(b)||N(e)||N(o))return"-";b=P(b,D+a.c+".",e);if(!N(b)){b=b.split(".");b[5]=b[5]?b[5]*1+1:1;b[3]=b[4];b[4]=o;b=b.join(".")}return b}function p(){return"file:"!=c.a[A].protocol&&t()}function f(b){if(!b||""==b)return"";for(;ea(b.charAt(0));)b=
O(b,1);for(;ea(b.charAt(b[x]-1));)b=O(b,0,b[x]-1);return b}function h(b,e,o,m){if(!N(b())){e(m?T(b()):b());U(b(),";")||o()}}function d(b){var e,o=""!=b&&c.a[A].host!=b;if(o)for(e=0;e<c.t[x];e++)o=o&&fa(W(b),W(c.t[e]))==-1;return o}var a=this,j=w,c=new Z.Gb,n=v,s=w;a.e=window;a.r=Math.round((new Date).getTime()/1E3);a.s=i||"UA-XXXXX-X";a.ab=c.a.referrer;a.ia=w;a.f=w;a.B=w;a.F=v;a.A=w;a.Ua="";a.g=w;a.cb=w;a.c=w;a.i=w;c.o=l?S(l):w;a.wc=function(){var b=v;if(a.B)b=a.B.match(/^[0-9a-z-_.]{10,1200}$/i);
return b};a.jc=function(){return Y()^a.A.$b()&2147483647};a.ec=function(){if(!c.b||""==c.b||"none"==c.b){c.b="";return 1}g();return c.Ra?ia(c.b):1};a.Yb=function(b,e){if(N(b))b="-";else{e+=c.h&&"/"!=c.h?c.h:"";e=b.indexOf(e);b=e>=0&&e<=8?"0":"["==b.charAt(0)&&"]"==b.charAt(b[x]-1)?"-":b}return b};a.wa=function(b){var e="",o=c.a;e+=c.fa?a.A.Ic():"";e+=c.da?a.Ua:"";e+=c.ga&&!N(o.title)?"&utmdt="+S(o.title):"";e+="&utmhid="+ja()+"&utmr="+S(a.ia)+"&utmp="+S(a.Bc(b));return e};a.Bc=function(b){var e=c.a[A];
return b=w!=b&&""!=b?S(b,r):S(e.pathname+e.search,r)};a.Lc=function(b){if(a.J()){var e="";if(a.g!=w&&a.g.G()[x]>0)e+="&utme="+S(a.g.G());e+=a.wa(b);j.H(e,a.s,a.c)}};a.Tb=function(){var b=new Z.$(c);return b.ua(a.c)?b.Hc():w};a._getLinkerUrl=function(b,e){var o=b.split("#"),m=b,q=a.Tb();if(q)if(e&&1>=o[x])m+="#"+q;else if(!e||1>=o[x])if(1>=o[x])m+=(U(b,"?")?B:"?")+q;else m=o[0]+(U(b,"?")?B:"?")+q+"#"+o[1];return m};a.Fc=function(){var b;if(a.wc()){a.i.Dc(a.B);a.i.Oc();Z._gasoDomain=c.b;Z._gasoCPath=
c.h;b=c.a.createElement("script");b.type="text/javascript";b.id="_gasojs";b.src="https://www.google.com/analytics/reporting/overlay_js?gaso="+a.B+B+Y();c.a.getElementsByTagName("head")[0].appendChild(b)}};a.pc=function(){var b=a.r,e=a.i,o=e.k(),m=a.c+"",q=c.e,u=q?q.gaGlobal:w,z,M=U(o,D+m+"."),la=U(o,E+m),ma=U(o,G+m),F,I=[],R="",ha=v;o=N(o)?"":o;if(c.z){z=c.a[A]&&c.a[A].hash?c.a[A].href.substring(c.a[A].href.indexOf("#")):"";if(c.ba&&!N(z))R=z+B;R+=c.a[A].search;if(!N(R)&&U(R,D)){e.zc(R);e.kb()||e.Sb();
F=e.ja()}h(e.ma,e.vb,e.Eb,true);h(e.la,e.Aa,e.Fa)}if(N(F))if(M)if(!la||!ma){F=k(o,";",b);a.F=r}else{F=P(o,D+m+".",";");I=X(P(o,E+m,";"),".")}else{F=ga([m,a.jc(),b,b,b,1],".");ha=a.F=r}else if(N(e.C())||N(e.ka())){F=k(R,B,b);a.F=r}else{I=X(e.C(),".");m=I[0]}F=F.split(".");if(q&&u&&u.dh==m&&!c.o){F[4]=u.sid?u.sid:F[4];if(ha){F[3]=u.sid?u.sid:F[4];if(u.vid){b=u.vid.split(".");F[1]=b[0];F[2]=b[1]}}}e.tb(F.join("."));I[0]=m;I[1]=I[1]?I[1]:0;I[2]=w!=I[2]?I[2]:c.Jc;I[3]=I[3]?I[3]:F[4];e.ya(I.join("."));
e.ub(m);N(e.lc())||e.za(e.P());e.Cb();e.Ea();e.Db()};a.rc=function(){j=new Z.Kb(c)};a._initData=function(){var b;if(!n){if(!a.A){a.A=new Z.Fb(c);a.A.bc()}a.c=a.ec();a.i=new Z.$(c);a.g=new Z.N;s=new Z.Ib(c,a.c,a.i,a.g);a.rc()}if(p()){a.pc();s.tc()}if(!n){if(p()){a.ia=a.Yb(a.ab,c.a.domain);if(c.da){b=new Z.m(a.c,a.ia,a.r,c);a.Ua=b.cc(a.i,a.F)}}a.cb=new Z.N;n=r}Z.ib||a.sc()};a._visitCode=function(){a._initData();var b=P(a.i.k(),D+a.c+".",";");b=b.split(".");return b[x]<4?"":b[1]};a._cookiePathCopy=function(b){a._initData();
a.i&&a.i.Nc(a.c,b)};a.sc=function(){var b=c.a[A].hash;if(b&&1==b.indexOf("gaso="))b=P(b,"gaso=",B);else b=(b=c.e.name)&&0<=b.indexOf("gaso=")?P(b,"gaso=",B):P(a.i.k(),L,";");if(b[x]>=10){a.B=b;a.Fc()}Z.ib=r};a.J=function(){return a._visitCode()%1E4<c.U*100};a.Gc=function(){var b,e,o=c.a.links;if(!c.lb){b=c.a.domain;if("www."==O(b,0,4))b=O(b,4);c.t.push("."+b)}for(b=0;b<o[x]&&(c.ra==-1||b<c.ra);b++){e=o[b];if(d(e.host))if(!e.gatcOnclick){e.gatcOnclick=e.onclick?e.onclick:a.yc;e.onclick=function(m){var q=
!this.target||this.target=="_self"||this.target=="_top"||this.target=="_parent";q=q&&!a.Rb(m);a.Mc(m,this,q);return q?v:this.gatcOnclick?this.gatcOnclick(m):r}}}};a.yc=function(){};a._trackPageview=function(b){if(p()){a._initData();c.t&&a.Gc();a.Lc(b);a.F=v}};a._trackTrans=function(){var b=a.c,e=[],o,m,q;a._initData();if(a.f&&a.J()){for(o=0;o<a.f.Y[x];o++){m=a.f.Y[o];V(e,m.Ca());for(q=0;q<m.R[x];q++)V(e,m.R[q].Ca())}for(o=0;o<e[x];o++)j.H(e[o],a.s,b,r)}};a._setTrans=function(){var b=c.a,e,o,m;b=b.getElementById?
b.getElementById("utmtrans"):b.utmform&&b.utmform.utmtrans?b.utmform.utmtrans:w;a._initData();if(b&&b.value){a.f=new Z.n;m=b.value.split("UTM:");c.u=!c.u||""==c.u?"|":c.u;for(b=0;b<m[x];b++){m[b]=f(m[b]);e=m[b].split(c.u);for(o=0;o<e[x];o++)e[o]=f(e[o]);if("T"==e[0])a._addTrans(e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8]);else"I"==e[0]&&a._addItem(e[1],e[2],e[3],e[4],e[5],e[6])}}};a._addTrans=function(b,e,o,m,q,u,z,M){a.f=a.f?a.f:new Z.n;return a.f.Ob(b,e,o,m,q,u,z,M)};a._addItem=function(b,e,o,m,q,u){var z;
a.f=a.f?a.f:new Z.n;(z=a.f.hb(b))||(z=a._addTrans(b,"","","","","","",""));z.Nb(e,o,m,q,u)};a._setVar=function(b){if(b&&""!=b&&t()){a._initData();s.Ec(S(b));a.J()&&j.H("&utmt=var",a.s,a.c)}};a._setCustomVar=function(b,e,o,m){a._initData();return s.Cc(b,e,o,m)};a._deleteCustomVar=function(b){a._initData();s.Ub(b)};a._getVisitorCustomVar=function(b){a._initData();return s.mc(b)};a._setMaxCustomVariables=function(b){c.ob=b};a._link=function(b,e){if(c.z&&b){a._initData();c.a[A].href=a._getLinkerUrl(b,
e)}};a._linkByPost=function(b,e){if(c.z&&b&&b.action){a._initData();b.action=a._getLinkerUrl(b.action,e)}};a._setXKey=function(b,e,o){a.g._setKey(b,e,o)};a._setXValue=function(b,e,o){a.g._setValue(b,e,o)};a._getXKey=function(b,e){return a.g._getKey(b,e)};a._getXValue=function(b,e){return a.g.getValue(b,e)};a._clearXKey=function(b){a.g._clearKey(b)};a._clearXValue=function(b){a.g._clearValue(b)};a._createXObj=function(){a._initData();return new Z.N};a._sendXEvent=function(b){var e="";a._initData();
if(a.J()){e+="&utmt=event&utme="+S(a.g.Ac(b))+a.wa();j.H(e,a.s,a.c,v,r)}};a._createEventTracker=function(b){a._initData();return new Z.Jb(b,a)};a._trackEvent=function(b,e,o,m){var q=a.cb;if(w!=b&&w!=e&&""!=b&&""!=e){q._clearKey(5);q._clearValue(5);(b=q._setKey(5,1,b)&&q._setKey(5,2,e)&&(w==o||q._setKey(5,3,o))&&(w==m||q._setValue(5,1,m)))&&a._sendXEvent(q)}else b=v;return b};a.Mc=function(b,e,o){a._initData();if(a.J()){var m=new Z.N;m._setKey(6,1,e.href);var q=o?function(){a.db(b,e)}:w;j.H("&utmt=event&utme="+
S(m.G())+a.wa(),a.s,a.c,v,r,q);if(o){var u=this;c.e.setTimeout(function(){u.db(b,e)},500)}}};a.db=function(b,e){if(!b)b=c.e.event;var o=r;if(e.gatcOnclick)o=e.gatcOnclick(b);if(o||typeof o=="undefined")if(!e.target||e.target=="_self")c.e[A]=e.href;else if(e.target=="_top")c.e.top.document[A]=e.href;else if(e.target=="_parent")c.e.parent.document[A]=e.href};a.Rb=function(b){if(!b)b=c.e.event;var e=b.shiftKey||b.ctrlKey||b.altKey;if(!e)if(b.modifiers&&c.e.Event)e=b.modifiers&c.e.Event.CONTROL_MASK||
b.modifiers&c.e.Event.SHIFT_MASK||b.modifiers&c.e.Event.ALT_MASK;return e};a.Pc=function(){return c};a._setDomainName=function(b){c.b=b};a._addOrganic=function(b,e,o){c.T.splice(o?0:c.T.length,0,new Z.Ha(b,e))};a._clearOrganic=function(){c.T=[]};a._addIgnoredOrganic=function(b){V(c.ta,b)};a._clearIgnoredOrganic=function(){c.ta=[]};a._addIgnoredRef=function(b){V(c.va,b)};a._clearIgnoredRef=function(){c.va=[]};a._setAllowHash=function(b){c.Ra=b?1:0};a._setCampaignTrack=function(b){c.da=b?1:0};a._setClientInfo=
function(b){c.fa=b?1:0};a._getClientInfo=function(){return c.fa};a._setCookiePath=function(b){c.h=b};a._setTransactionDelim=function(b){c.u=b};a._setCookieTimeout=function(b){a._setCampaignCookieTimeout(b*1E3)};a._setCampaignCookieTimeout=function(b){c.Ta=b};a._setDetectFlash=function(b){c.ha=b?1:0};a._getDetectFlash=function(){return c.ha};a._setDetectTitle=function(b){c.ga=b?1:0};a._getDetectTitle=function(){return c.ga};a._setLocalGifPath=function(b){c.oa=b};a._getLocalGifPath=function(){return c.oa};
a._setLocalServerMode=function(){c.I=0};a._setRemoteServerMode=function(){c.I=1};a._setLocalRemoteServerMode=function(){c.I=2};a._getServiceMode=function(){return c.I};a._setSampleRate=function(b){c.U=b};a._setSessionTimeout=function(b){a._setSessionCookieTimeout(b*1E3)};a._setSessionCookieTimeout=function(b){c.sb=b};a._setAllowLinker=function(b){c.z=b?1:0};a._setAllowAnchor=function(b){c.ba=b?1:0};a._setCampNameKey=function(b){c.Ia=b};a._setCampContentKey=function(b){c.Ja=b};a._setCampIdKey=function(b){c.Ka=
b};a._setCampMediumKey=function(b){c.La=b};a._setCampNOKey=function(b){c.Ma=b};a._setCampSourceKey=function(b){c.Na=b};a._setCampTermKey=function(b){c.Oa=b};a._setCampCIdKey=function(b){c.Pa=b};a._getAccount=function(){return a.s};a._setAccount=function(b){a.s=b};a._setNamespace=function(b){c.o=b?S(b):w};a._getVersion=function(){return ca};a._setAutoTrackOutbound=function(b){c.t=[];if(b)c.t=b};a._setTrackOutboundSubdomains=function(b){c.lb=b};a._setHrefExamineLimit=function(b){c.ra=b};a._setReferrerOverride=
function(b){a.ab=b};a._setCookiePersistence=function(b){a._setVisitorCookieTimeout(b)};a._setVisitorCookieTimeout=function(b){c.v=b}};Z._getTracker=function(i,l){return new Z.aa(i,l)};var ka=v,$={ca:{},_createAsyncTracker:function(i,l){l=l||"";i=new Z.aa(i);$.ca[l]=i;ka=r;return i},_getAsyncTracker:function(i){i=i||"";var l=$.ca[i];if(!l){l=new Z.aa;$.ca[i]=l;ka=r}return l},push:function(){for(var i=arguments,l=0,g=0;g<i[x];g++)try{if(typeof i[g]==="function")i[g]();else{var t="",k=i[g][0],p=k.lastIndexOf(".");if(p>0){t=O(k,0,p);k=O(k,p+1)}var f=$._getAsyncTracker(t);f[k].apply(f,i[g].slice(1))}}catch(h){l++}return l}};window[aa]=Z;function na(){var i=window[ba],l=v;if(i&&typeof i.push=="function"){l=i.constructor==Array;if(!l)return}window[ba]=$;l&&$.push.apply($,i)}na();})()



var pageTracker = _gat._getTracker("UA-3940914-2");
pageTracker._initData();
pageTracker._trackPageview();



if(!(htr('hittail_ok'))){htc=document.referrer;htz=htl(document.location.href);if(htz!=htl(htc)&&(htc!='')){if(htw(htc)){kw=htq(htc);htAdt=htAdTk(document.location.href);document.write('<img src="http://tracking.hittail.com/mlt.png?ref='+escape(htc)+'&kw='+kw+'&eng='+htm(htc)+'&p='+htF(htc)+'&n='+htn(kw)+'&adt='+htAdt+'" width="1" height="1"/>');}}hty('hittail_ok','1','','/',document.domain,'');}function htw(hte){var htd=true;var htj=new Array("http://private.","http://internal.","http://intranet.","login=","/login","login.","logon=","/logon","logon.","/signin","signin=","signin.","signon","/admin/","mail.","/mail/","/email/","webmail","mailbox","https://","cache:","http://www.blogger.com","http://localhost","http://client.","http://docs.","http://timebase.","http://www2.blogger.","http://www.typepad.com/t/app/","http://www.typepad.com/t/comments","http://blockedReferrer");for(i=0;i<htj.length;i++){if(hte.search(htj[i])> -1){htd=false;return htd;}}var htE=/https?:\/\/(www\.|\d+\.)?hittail\.com/;var hto=/https?:\/\/(www\.|\d+\.)?mylongtail\.com/;if(hte.search(htE)> -1||hte.search(hto)> -1){htd=false;}return htd;};function htk(hta){return unescape(hta.replace(/\+/g," "));};function htm(url){var htH=/(http:\/\/)([^\/]*?)(\/)/;htH.test(url);hti=RegExp.$2;return hti;};function htq(url){var htG=/(\?|&|&amp;|;){1}(q|p|query|t|w|search|as_q|wd){1}=(.[^&=]*)=?/i;htG.test(url);kw=htk(RegExp.$3);if(kw.indexOf('cache:')>=0||kw.indexOf('http://')>=0||kw.indexOf('invocationType')>=0|| !isNaN(kw)){kw='';}else{kw=htD(kw);}return kw;};function htD(hta){hta=hta.replace(/[^\w #\.\-^\u00c0-\u00ff]/g,'');return hta;};function htF(url){p=0;htI=/\.google\./;if(htI.test(url)){htJ=/google(.*?)(start=)([0-9]+)/;htJ.test(url);p=RegExp.$3;if(p!=''){p=p/10;}else{p=1;}}if(p==0||p==''){hts=/\.yahoo\./;if(hts.test(url)){htt=/yahoo(.*?)b=([0-9]+)/;htt.test(url);p=RegExp.$2;if(p!=''){p=(p-1)/10+1;}else{p=1;}}}if(p==0||p==''){htg=/msn|live\.com/;if(htg.test(url)){htp=/msn|live\.com(.*?)(\?|&)first=([0-9]+)/;htp.test(url);p=RegExp.$3;if(p!=''){p=(p-1)/10+1;}else{p=1;}}}if(p==0||p==''){htg=/ask\.com/;if(htg.test(url)){htB=/ask(.*?)(\?|&)page=([0-9]+)/;htB.test(url);p=RegExp.$3;if(p!=''){p=(p-1)/10;}else{p=1;}}}return p;};function htn(hta){hta=hta.replace(/^\s+|\s+$/g,'');var htv=hta.split(/\s/);w=htv.length;return w;};function hty(name,value,expires,htf,domain,hth){var htx=name+"="+escape(value)+((htf)?"; htf="+htf:"")+((domain)?"; domain="+domain:"")+((hth)?"; hth":"");document.cookie=htx;};function htr(name){var dc=document.cookie;var prefix=name+"=";var htb=dc.indexOf("; "+prefix);if(htb== -1){htb=dc.indexOf(prefix);if(htb!=0)return null;}else htb+=2;var end=document.cookie.indexOf(";",htb);if(end== -1)end=dc.length;return unescape(dc.substring(htb+prefix.length,end));};function htl(url){var htb,end;htb=url.indexOf('//')+2;if(url.indexOf('/',8)){end=url.indexOf('/',8);}else{end=url.length}return url.substring(htb,end);};function htAdTk(url)

{if ( (url.indexOf('gclid') > 0) || (url.indexOf('ysmkey') > 0) || (url.indexOf('OVRAW') > 0) || (url.indexOf('OVKEY') > 0) ){ad = 1;}else{ad = 0;}return ad;}



