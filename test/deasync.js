/* eslint-env mocha */

const assert = require("assert");
const redis = require("redis");
const client = redis.createClient();
const Rebridge = require("../index.js");

const db = new Rebridge(client, {
	lock: true,
	clients: [client],
	mode: "deasync"
});

describe("Deasync mode", function() {
	describe("top level", function() {
		it("should allow setting properties", () => {
			db.hello = {};
			// assert(db.hello == {});
		});
		it.skip(
			"should return undefined on unknown keys",
			() => db.unknown_key._promise
				.then(val => assert.equal(val, undefined))
		);
		it.skip("should allow the `in` operator", () => assert.throws(() => "hello" in db));
		it.skip("should allow the `delete` operator", () => assert.throws(() => delete db.hello));
	});
	describe("second level", function() {
		it("should set hello.world", function() {
			db.hello = {};
			db.hello.world = {};
		});
		it("should set hello.world.foo", () => {
			db.hello.world.foo = {};
		});
		it("should set hello.world.foo.bar", () => {
			db.hello.world.foo.bar = true;
		});
		it.skip(
			"should read hello correctly",
			() => db.hello._promise
				.then(val => assert.deepStrictEqual(val, {world: {foo: {bar: true}}}))
		);
		it.skip(
			"should throw on subkeys of unknown keys",
			() => new Promise((resolve, reject) => db.unknown_key.unknown_key._promise.then(reject).catch(resolve))
		);
		it.skip(
			"should implement the `delete` operator",
			() => db.example.set({
				1: 'one',
				2: 'two',
				3: 'three',
				4: 'four'
			})
				.then(() => db.example.delete(3))
				.then(() => db.example._promise)
				.then(val => assert.deepStrictEqual(val, {1: 'one', 2: 'two', 4: 'four'}))
		);
		it.skip(
			"should implement the `in` operator",
			() => db.example.set({
				1: 'one',
				2: 'two',
				3: 'three',
				4: 'four'
			})
				.then(() => db.example.in(3))
				.then(val => assert.strictEqual(val, true))
		);
		it.skip(
			"should implement `push`",
			() => db.example.set([1, 2, 3])
				.then(() => db.example.push(4))
				.then(() => db.example._promise)
				.then(val => assert.deepStrictEqual(val, [1, 2, 3, 4]))
		);
		it.skip(
			"should implement `pop`",
			() => db.example.set([1, 2, 3, 4])
				.then(() => db.example.pop())
				.then(val => assert.strictEqual(val, 4))
				.then(() => db.example._promise)
				.then(val => assert.deepStrictEqual(val, [1, 2, 3]))
		);
		it.skip(
			"should implement `slice`",
			() => db.example.set([1, 2, 3, 4])
				.then(() => db.example.slice(1, 3))
				.then(val => assert.deepStrictEqual(val, [2, 3]))
		);
		it.skip(
			"should implement `splice`",
			() => db.example.set(["foo", "bar", "baz", "test"])
				.then(() => db.example.splice(1, 2))
				.then(val => assert.deepStrictEqual(val, ["bar", "baz"]))
				.then(() => db.example._promise)
				.then(val => assert.deepStrictEqual(val, ["foo", "test"]))
		);
		it.skip(
			"should respect forced properties",
			() => db.example.set({push: "foo bar"})
				.then(() => db.example.__prop_push._promise)
				.then(val => assert.strictEqual(val, "foo bar"))
		);
		it.skip(
			"should respect forced functions",
			() => db.example.set("foo bar")
				.then(() => db.example.__func_toUpperCase())
				.then(val => assert.strictEqual(val, "FOO BAR"))
		);
	});
});

after(() => client.quit());