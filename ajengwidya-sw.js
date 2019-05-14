//Mendefinisikan file yang akan disimpan dalam cache
var	filesToCache = [
	'.',
	'style/main.css',
	'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
	'images/birds_medium.jpg',
	'images/horses_medium.jpg',
	'images/volt_medium.jpg',
	'images/still_life_medium.jpg',
	'index.html',
	'pages/offline.html',
	'pages/404.html'
];


//Mendefinisikan nama cache sebagai 'pages-cache-v2'
var	staticCacheName	= 'pages-cache-v2';


//Menginstall SW. Keterangan yang akan muncul dalam console log saat instalasi yaitu 'Attempting to install service worker and cache static assets'
//Instalasi akan selesai setelah semua file yang didefinisikan dalam variabel filesToCache berhasil ditambahkan dalam cache
self.addEventListener('install', function(event)	{
	console.log('Attempting	to install service worker and cache	static assets');
	event.waitUntil(
		caches.open(staticCacheName) //Membuat cache
		.then(function(cache)	{
			return cache.addAll(filesToCache); //Proses menambahkan file yang didefinisikan ke dalam cache
		})
	);
});


//Mengaktivasi SW. Keterangan yang akan muncul dalam console log yaitu 'Activating new service worker...'
//Selain mengaktivasi, proses ini juga akan menghapus cache lama yang telah ada (dengan nama yang sama) sebelum menjalankan SW baru. Dengan kata lain, akan dilakukan update terhadap cache. Cache yang lama akan dihapus
self.addEventListener('activate', function(event)	{
	console.log('Activating	new	service	worker...');
	var	cacheWhitelist = [staticCacheName]; //Data disimpan sebagai array
	event.waitUntil(
		caches.keys().then(function(cacheNames)	{
			return	Promise.all( //Asynchronus yang menunggu proses lain selesai
				cacheNames.map(function(cacheName) { 
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});


//Event fetch berfungsi untuk mengambil data dari server. respondWith() digunakan untuk membuat custom respond. Pertama, dilakukan pengecekkan pada cache jika memiliki data yang di-request.
self.addEventListener('fetch', function(event)	{
	console.log('Fetch event for ',	event.request.url);
	event.respondWith(
		caches.match(event.request).then(function(response)	{
			if	(response)	{
				console.log('Found ', event.request.url, ' in cache');
				return	response;
			}
			//Jika data yang dicari tidak ditemukan dalam cache, maka request akan diteruskan ke server melalui internet
			console.log('Network request for ', event.request.url);
			return	fetch(event.request)
			//TODO 4 - Add fetched files to the cache
			//Ketika server mengirim respon, maka SW akan melakukan fetch terhadap data
			.then(function(response)	{
				//TODO 5 - Respond with custom 404 page
				if (response.status === 404) {
		          return caches.match('pages/404.html');
		        }
				return	caches.open(staticCacheName).then(function(cache)	{
					if	(event.request.url.indexOf('test')	<	0)	{
						cache.put(event.request.url, response.clone());
					}
					return	response;
				});
			});
		}).catch(function(error)	{
			//TODO 6 - Respond with custom offline page
			console.log('Error, ', error);
  			return caches.match('pages/offline.html');
		})
	);
});