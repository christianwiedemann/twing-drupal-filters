var assert = require('assert')
var twigPackage = require('twig')
var twigFilters = require('..')

var twig = twigPackage.twig

describe('twig-drupal', function () {
  // Add the Twig Filters to Twig.
  twigFilters(twigPackage)

  /**
   * Tests the clean_class filter.
   *
   * @see \Drupal\Tests\Component\Utility\testCleanCssIdentifier
   * @see \Drupal\Tests\Component\Utility\testHtmlClass
   */
  it('should use the clean_class filter', function (done) {
    var tests = [
      // Verify that no valid ASCII characters are stripped from the identifier.
      {
        data: {value: 'abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789'},
        expected: 'abcdefghijklmnopqrstuvwxyz-abcdefghijklmnopqrstuvwxyz-0123456789'
      },
      // Verify that valid UTF-8 characters are not stripped from the identifier.
      {
        data: {value: '¡¢£¤¥'},
        expected: '¡¢£¤¥'
      },
      // Verify that double underscores are not stripped from the identifier.
      {
        data: {value: 'css__identifier__with__double__underscores'},
        expected: 'css__identifier__with__double__underscores'
      },
      // Verify that invalid characters (including non-breaking space) are
      // stripped from the identifier.
      {
        data: {value: 'invalid !"#$%&\'()*+,./:;<=>?@[\\]^`{|}~ identifier'},
        expected: 'invalid---identifier'
      },
      // Verify that an identifier starting with a digit is replaced.
      {
        data: {value: '1cssidentifier'},
        expected: '_cssidentifier'
      },
      // Verify that an identifier starting with a hyphen followed by a digit is
      // replaced.
      {
        data: {value: '-1cssidentifier'},
        expected: '__cssidentifier'
      },
      // Verify that an identifier starting with two hyphens is replaced.
      {
        data: {value: '--cssidentifier'},
        expected: '__cssidentifier'
      },
      // Verify Drupal coding standards are enforced.
      {
        data: {value: 'CLASS NAME_[Ü]'},
        expected: 'class-name--ü'
      }
    ]

    var template = twig({
      data: '{{ value|clean_class }}'
    })

    var outputs = tests.map(function (test) {
      return template.render(test.data)
    })

    outputs.forEach(function (output, index) {
      assert.strictEqual(output, tests[index].expected)
    })

    done()
  })

  it('should create a link', function (done) {
    var template = twig({
      data: 'Visit my {{ link(title, url, attributes) }}!'
    })
    var output = template.render({
      title: 'Website',
      url: 'http://example.com',
      attributes: {
        class: ['foo', 'bar', 'baz']
      }
    })
    assert.strictEqual(output, 'Visit my <a href="http://example.com" class="foo bar baz">Website</a>!')

    output = template.render({
      title: 'Site',
      url: 'http://example.com',
      attributes: {
        class: 'awesome'
      }
    })
    assert.strictEqual(output, 'Visit my <a href="http://example.com" class="awesome">Site</a>!')
    done()
  })
})
