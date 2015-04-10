/*
 * Copyright (C) eZ Systems AS. All rights reserved.
 * For full copyright and license information view LICENSE file distributed with this source code.
 */
YUI.add('ez-universaldiscoveryconfirmedlistview-tests', function (Y) {
    var renderTest, confirmedListChangeTest, toggleShowFullListTest,
        showHideFullListTest, closeLinkTest, resetTest,
        clickOutsideTest, removeButtonTest,
        Assert = Y.Assert, Mock = Y.Mock;

    renderTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List render tests',

        setUp: function () {
            this.structs = [];
            this.structsJson = [];
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView();
        },

        "Should use the template": function () {
            var templateCalled = false,
                origTpl = this.view.template;

            this.view.template = function () {
                templateCalled = true;
                return origTpl.apply(this, arguments);
            };

            this.view.render();
            Assert.isTrue(templateCalled, "render should use the template");
        },

        "Test render no list": function () {
            var origTpl = this.view.template;

            this.view.template = function (variables) {
                Assert.isFalse(
                    variables.miniDisplayList,
                    "The hasConfirmedList variable value should be false"
                );
                Assert.areEqual(
                    0, variables.remainingCount,
                    "The remainingCount variable value should be zero"
                );
                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isTrue(
                this.view.get('container').hasClass('is-empty'),
                "The view container should have the is-empty class"
            );
        },

        _getStructMocks: function () {
            var content = new Mock(),
                location = new Mock(),
                contentType = new Mock(),
                contentJson = {},
                locationJson = {},
                contentTypeJson = {},
                struct, structJson;

            Mock.expect(content, {
                method: 'toJSON',
                returns: contentJson,
            });
            Mock.expect(location, {
                method: 'toJSON',
                returns: locationJson,
            });
            Mock.expect(contentType, {
                method: 'toJSON',
                returns: contentTypeJson,
            });

            struct = {
                content: content,
                location: location,
                contentType: contentType,
            };
            structJson = {
                content: contentJson,
                location: locationJson,
                contentType: contentTypeJson,
            };
            this.structs.push(struct);
            this.structsJson.push(structJson);
            return struct;
        },

        _getContentList: function (size) {
            var list = [], i;

            for (i = 0; i != size; i++) {
                list.push(this._getStructMocks());
            }
            return list;
        },

        _testWithList: function (size, expectedContentCount, expectedRemainingCount) {
            var that = this,
                origTpl = this.view.template;

            this.view.set('confirmedList', this._getContentList(size));
            this.view.template = function (variables) {
                Assert.areEqual(
                    expectedRemainingCount, variables.remainingCount,
                    "The remainingCount variable value should be zero"
                );
                Assert.isArray(
                    variables.miniDisplayList,
                    "The miniDisplayList variable value should be an array"
                );
                Assert.areEqual(
                    expectedContentCount, variables.miniDisplayList.length,
                    "The miniDisplayList variable value should have one entry"
                );
                Assert.isArray(
                    variables.confirmedList,
                    "The confirmedList variable value should be an array"
                );
                Y.Array.each(variables.miniDisplayList, function (struct, i) {
                    Assert.areSame(
                        struct.content, that.structsJson[size - i - 1].content,
                        "The content toJSON result should be provided"
                    );
                    Assert.areSame(
                        struct.location, that.structsJson[size - i - 1].location,
                        "The location toJSON result should be provided"
                    );
                    Assert.areSame(
                        struct.contentType, that.structsJson[size - i - 1].contentType,
                        "The contentType toJSON result should be provided"
                    );
                });
                Y.Array.each(variables.confirmedList, function (struct, i) {
                    Assert.areSame(
                        struct.content, that.structsJson[size - i - 1].content,
                        "The content toJSON result should be provided"
                    );
                    Assert.areSame(
                        struct.location, that.structsJson[size - i - 1].location,
                        "The location toJSON result should be provided"
                    );
                    Assert.areSame(
                        struct.contentType, that.structsJson[size - i - 1].contentType,
                        "The contentType toJSON result should be provided"
                    );
                });

                return origTpl.apply(this, arguments);
            };
            this.view.render();
            Assert.isFalse(
                this.view.get('container').hasClass('is-empty'),
                "The view container should not have the is-empty class"
            );
        },

        "Test render below length limit list": function () {
            this._testWithList(2, 2, 0);
        },

        "Test render above length limit list": function () {
            this._testWithList(5, 3, 2);
        },

        tearDown: function () {
            this.view.destroy();
            delete this.mocks;
            delete this.view;
        },
    });

    confirmedListChangeTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List confirm list change tests',

        setUp: function () {
            this.structs = [];
            this.structsJson = [];
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        _getModelMock: function () {
            var mock = new Mock();

            Mock.expect(mock, {
                method: 'toJSON',
            });
            return mock;
        },

        "Should render the view": function () {
            var rendered = false,
                origTpl = this.view.template;

            this.view.template = function () {
                rendered = true;
                return origTpl.apply(this, arguments);
            };
            this.view.set('confirmedList', [{
                content: this._getModelMock(),
                location: this._getModelMock(),
                contentType: this._getModelMock(),
            }]);

            Assert.isTrue(rendered, "render should use the template");
        },

        "Should hide the full list and add the empty class": function () {
            var origTpl = this.view.template;

            this.view.set('confirmedList', [{
                content: this._getModelMock(),
                location: this._getModelMock(),
                contentType: this._getModelMock(),
            }]);
            this.view.template = function () {
                Assert.fail("The view should not have been rerendered");
                return origTpl.apply(this, arguments);
            };
            this.view._set('showFullList', true);
            this.view.set('confirmedList', null);
            Assert.isFalse(
                this.view.get('showFullList'),
                "The showFullList flag should be false"
            );
            Assert.isTrue(
                this.view.get('container').hasClass('is-empty'),
                "The container should get the is-empty class"
            );
        },
    });

    toggleShowFullListTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List toggle full list tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView({container: '.container'});
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should set the showFullList flag to true": function () {
            var container = this.view.get('container'),
                that = this;

            container.one('.ez-ud-mini-display-list').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isTrue(
                        this.view.get('showFullList'),
                        "The `showFullList` flag should be set to true"
                    );
                });
            });
            this.wait();
        },

        "Should set the showFullList flag to false": function () {
            var container = this.view.get('container'),
                that = this;

            this.view._set('showFullList', true);
            container.one('.ez-ud-mini-display-list').simulateGesture('tap', function () {
                that.resume(function () {
                    Assert.isFalse(
                        this.view.get('showFullList'),
                        "The `showFullList` flag should be set to false"
                    );
                });
            });
            this.wait();
        },
    });

    showHideFullListTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List show/hide the full list test',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView();
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should show the full list": function () {
            this.view._set('showFullList', true);

            Assert.isTrue(
                this.view.get('container').hasClass('is-full-list-visible'),
                "The full list should be visible"
            );
        },

        "Should hide the full list": function () {
            this["Should show the full list"]();
            this.view._set('showFullList', false);

            Assert.isFalse(
                this.view.get('container').hasClass('is-full-list-visible'),
                "The full list should be hidden"
            );
        },
    });

    closeLinkTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List close link tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView({container: '.container'});
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should hide the list": function () {
            var container = this.view.get('container'),
                that = this;

            this.view._set('showFullList', true);
            container.once('tap', function (e) {
                that.resume(function () {
                    Assert.isTrue(
                        !!e.prevented,
                        "The tap event should have been prevented"
                    );
                    Assert.isFalse(
                        this.view.get('showFullList'),
                        "The showFullList flag should be set to false"
                    );
                });
            });
            container.one('.ez-ud-full-list-close').simulateGesture('tap');
            this.wait();
        },
    });

    resetTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List reset tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should reset the attributes": function () {
            this.view.set('confirmedList', []);
            this.view._set('showFullList', true);
            this.view.reset();

            Assert.isNull(
                this.view.get('confirmedList'),
                "The confirmed list should be resetted to null"
            );
            Assert.isFalse(
                this.view.get('showFullList'),
                "The showFullList flag should be false"
            );
        },
    });

    clickOutsideTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List click outside tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView({container: '.container'});
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should hide the full list": function () {
            this.view._set('showFullList', true);

            Y.one('.outside').simulate('click');
            Assert.isFalse(
                this.view.get('showFullList'),
                "The full list should be hidden"
            );
        },
    });

    removeButtonTest = new Y.Test.Case({
        name: 'eZ Universal Discovery Confirmed List remove button tests',

        setUp: function () {
            this.view = new Y.eZ.UniversalDiscoveryConfirmedListView({container: '.container'});
            this.view.render();
        },

        tearDown: function () {
            this.view.destroy();
            delete this.view;
        },

        "Should fire the unselectContent event": function () {
            var that = this,
                button = this.view.get('container').one('button');

            this.view.on('unselectContent', function (e) {
                that.resume(function () {
                    Assert.areEqual(
                        button.getAttribute('data-content-id'),
                        e.contentId,
                        "The content id should be provided in the event facade"
                    );
                });
            });
            button.simulateGesture('tap');
            this.wait();
        },
    });

    Y.Test.Runner.setName("eZ Universal Discovery Confirmed List View tests");
    Y.Test.Runner.add(renderTest);
    Y.Test.Runner.add(confirmedListChangeTest);
    Y.Test.Runner.add(toggleShowFullListTest);
    Y.Test.Runner.add(showHideFullListTest);
    Y.Test.Runner.add(closeLinkTest);
    Y.Test.Runner.add(resetTest);
    Y.Test.Runner.add(clickOutsideTest);
    Y.Test.Runner.add(removeButtonTest);
}, '', {requires: ['test', 'node-event-simulate', 'ez-universaldiscoveryconfirmedlistview']});
