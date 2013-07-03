describe("Caryall", function() {

    describe(".deliver", function() {

        describe("manifest validation", function() {
            afterEach(function() {
                delete foo;
            });
            it("throws an InvalidManifestFormat with no manifest", function() {
                expect(function() { Carryall.deliver(); }).toThrow('The Caryall manifest must be an array.');
            });
            it("throws an InvalidManifestFormat with an invalid manifest key", function() {
                var manifest = [{'check': true, 'checkPassed': ['foo.js'], 'uhh': false}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(function() { Carryall.deliver(manifest, cargo); })
                    .toThrow('A manifest item has the following invalid key: uhh');
            });
            it("throws an InvalidManifestFormat if manifest is not an array", function() {
                var manifest = {'name': 'foo.js', 'check': true, 'checkPassed': ['foo.js']};
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(function() { Carryall.deliver(manifest, cargo); })
                    .toThrow('The Caryall manifest must be an array.');
            });
        });

        describe("cargo validation", function() {
            afterEach(function() {
                delete foo;
            });
            it("throws an InvalidCargoFormat with no cargo", function() {
                var manifest = [{'check': true, 'checkPassed': ['foo.js']}];
                expect(function() { Carryall.deliver(manifest); }).toThrow('The Caryall cargo must be an array.');
            });
            it("throws an InvalidCargoFormat with an invalid cargo key", function() {
                var manifest = [{'check': true, 'checkPassed': ['foo.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};", 'uhh': false}];
                expect(function() { Carryall.deliver(manifest, cargo); })
                    .toThrow('A cargo item has the following invalid key: uhh');
            });
            it("throws an InvalidCargoFormat if cargo is not an array", function() {
                var manifest = [{'check': true, 'checkPassed': ['foo.js']}];
                var cargo = {'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"};
                expect(function() { Carryall.deliver(manifest, cargo); })
                    .toThrow('The Caryall cargo must be an array.');
            });
        });

        describe("post check action validation", function() {
            afterEach(function() {
                delete foo;
            });
            it("throws an InvalidPostCheckFormat if post check action is not an array", function() {
                var manifest = [{'check': true, 'checkPassed': 'foo.js'}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(function() { Carryall.deliver(manifest, cargo); })
                    .toThrow("An array of cargo names must be specified when using 'checkPassed' and/or 'checkFailed'.");
            });
            it("throws an InvalidPostCheckFormat if post check action element is not a string", function() {
                var manifest = [{'check': true, 'checkPassed': [400.75]}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(function() { Carryall.deliver(manifest, cargo); })
                    .toThrow("Cargo names must be specified as type 'String' when using 'checkPassed' and/or 'checkFailed'.");
            });
        });

        describe("corrupt cargo", function() {
            afterEach(function() {
                delete foo;
            });
            it("throws a CorruptCargo if cargo evaluation results in an error", function() {
                var manifest = [{'check': true, 'checkPassed': ['foo.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "fail;"}];
                expect(function() { Carryall.deliver(manifest, cargo); })
                    .toThrow("The following cargo is corrupt: 'foo.js'. Delivery aborted.");
            });
        });

        describe("missing cargo", function() {
            afterEach(function() {
                delete foo;
            });
            it("throws a CargoNotFound for missing cargo", function() {
                var manifest = [{'check': true, 'checkPassed': ['foo.js', 'bar.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(function() { Carryall.deliver(manifest, cargo); })
                    .toThrow("The following cargo could not be found: 'bar.js'. Delivery aborted.");
            });
        });

        describe("checkPassed", function() {
            afterEach(function() {
                delete foo;
                delete bar;
                delete baz;
            });
            it("unpacks the cargo with a valid manifest and a static check", function() {
                var manifest = [{'check': true, 'checkPassed': ['foo.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(typeof foo == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(true);
            });
            it("unpacks multiple cargo items with a valid manifest and a static check", function() {
                var manifest = [{'check': true, 'checkPassed': ['foo.js', 'baz.js']}];
                var cargo = [
                    {'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"},
                    {'name': 'baz.js', 'payload': "window.baz = function foo() {return 'baz';};"}
                ];
                expect(typeof foo == 'undefined').toBe(true);
                expect(typeof baz == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(true);
                expect(typeof baz == 'function').toBe(true);
            });
            it("unpacks the cargo with a valid manifest and a functional check", function() {
                var manifest = [{'check': function(){ return true;}, 'checkPassed': ['foo.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(typeof foo == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(true);
            });
            it("unpacks the cargo with a valid manifest and an eval functional check", function() {
                var manifest = [{'check': "function() { return true;}", 'checkPassed': ['foo.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(typeof foo == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(true);
            });
            it("does not unpack the checkPassed cargo if the check failed", function() {
                var manifest = [{'check': false, 'checkPassed': ['foo.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(typeof foo == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(false);
            });
            it("does not unpack the checkFailed cargo if the check passed", function() {
                var manifest = [{'check': true, 'checkPassed': ['foo.js'], 'checkFailed': ['bar.js'] }];
                var cargo = [
                    {
                        'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"
                    },
                    {
                        'name': 'bar.js', 'payload': "window.bar = function bar() {return 'bar';};"
                    }
                ];
                expect(typeof foo == 'undefined').toBe(true);
                expect(typeof bar == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(true);
                expect(typeof bar == 'function').toBe(false);
            });
        });

        describe("checkFailed", function() {
            afterEach(function() {
                delete foo;
                delete bar;
                delete baz;
            });
            it("unpacks the cargo with a valid manifest and a static check", function() {
                var manifest = [{'check': false, 'checkFailed': ['foo.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(typeof foo == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(true);
            });
            it("unpacks multiple cargo items with a valid manifest and a static check", function() {
                var manifest = [{'check': false, 'checkFailed': ['foo.js', 'baz.js']}];
                var cargo = [
                    {'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"},
                    {'name': 'baz.js', 'payload': "window.baz = function foo() {return 'baz';};"}
                ];
                expect(typeof foo == 'undefined').toBe(true);
                expect(typeof baz == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(true);
                expect(typeof baz == 'function').toBe(true);
            });
            it("unpacks the cargo with a valid manifest and a functional check", function() {
                var manifest = [{'check': function(){ return false;}, 'checkFailed': ['foo.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(typeof foo == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(true);
            });
            it("does not unpack the checkFailed cargo if the check passed", function() {
                var manifest = [{'check': true, 'checkFailed': ['foo.js']}];
                var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
                expect(typeof foo == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(false);
            });
            it("does not unpack the checkPassed cargo if the check failed", function() {
                var manifest = [{'check': false, 'checkPassed': ['foo.js'], 'checkFailed': ['bar.js'] }];
                var cargo = [
                    {
                        'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"
                    },
                    {
                        'name': 'bar.js', 'payload': "window.bar = function bar() {return 'bar';};"
                    }
                ];
                expect(typeof foo == 'undefined').toBe(true);
                expect(typeof bar == 'undefined').toBe(true);
                Carryall.deliver(manifest, cargo);
                expect(typeof foo == 'function').toBe(false);
                expect(typeof bar == 'function').toBe(true);
            });
        });
    });

});