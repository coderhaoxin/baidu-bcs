### baidu-bcs
* baidu bcs node.js sdk

### install
```bash
npm install baidu-bcs
```

### api
* putBucket
* listBucket
* deleteBucket
* putObject
* copyObject
* putSuperfile
* getObject
* headObject
* listObject
* deleteObject
* putAcl
* getAcl

### document

create bcs client
```js
var BCS = require('baidu-bcs')
var bcs = BCS.createClient({
	accessKey: 'your access key',
	secretKey: 'your secret key'
})
```

put bucket
```js
bcs.putBucket({
	bucket: '',
	acl: ''
}, function (error, result) {})
```

put bucket with acl
```js
bcs.putBucket({
	bucket: '',
	acl: ''
}, function (error, result) {})
```

list bucket
```js
bcs.listBucket(function (error, result) {})
```

delete bucket
```js
bcs.deleteBucket({
	bucket: ''
}, function (error, result) {})
```

put object with file path
```js
bcs.putObject({
	bucket: '',
	object: '',
	source: './index.js'
}, function (error, result) {})
```


put object with buffer
```js
bcs.putObject({
	bucket: '',
	object: '',
	source: new Buffer('baidu-bcs'),
	headers: {
		'Content-Type': 'text/plain'
	}
}, function (error, result) {})
```

put object with stream
```js
bcs.putObject({
	bucket: '',
	object: '',
	source: fs.createReadStream(__filename),
	headers: {
		'Content-Type': 'text/plain'
	}
}, function (error, result) {})
```

put object with headers
```js
```

copy object
```js
```

head object
```js
```

list object
```js
```

get object
```js
```

delete bucket
```js
bcs.deleteBucket({
	bucket: ''
}, function (error, result) {})
```

put acl
```js
bcs.putAcl({
	bucket: '',
	acl: 'private'
}, function (error, result) {})
```

get acl
```js
bcs.getAcl({
	bucket: ''
}, function (error, result) {})
```

### params note
* bucket - bucket name
* object - object name
* the `result` of callback is a object contain: `status`, `headers`, `body`
