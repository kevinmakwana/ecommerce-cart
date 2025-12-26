# Code Quality Tools & Standards

Comprehensive guide to maintaining high code quality with automated tools.

## Overview

This project maintains strict code quality through 4 automated tools:

| Tool | Purpose | Speed | Auto-Fix | Status |
|------|---------|-------|----------|--------|
| **Pint** | Code style (PSR-12) | ⚡️ Fast | ✅ Yes | ✅ 0 issues |
| **PHPStan** | Type safety & bugs | 🐢 Slower | ❌ No | ✅ 0 errors |
| **PHPMD** | Code quality & smells | ⚡️ Fast | ❌ No | ✅ 0 warnings |
| **Rector** | Auto-refactoring | 🐢 Slower | ✅ Yes | ✅ Applied |

---

## Quality Assurance Workflow

### Complete Quality Check Pipeline

```bash
# Run all checks + tests (recommended)
./vendor/bin/sail composer qa:full
```

This runs:
1. **Pint** - Auto-fix code style
2. **Rector** - Apply refactoring patterns
3. **PHPStan** - Static analysis
4. **PHPMD** - Code quality check
5. **PHPUnit** - Backend tests (135 tests)
6. **Jest** - Frontend tests (253 tests)

### Quick Fix Mode

```bash
# Auto-fix style and refactoring issues
./vendor/bin/sail composer qa:fix
```

Runs:
- Pint (with --fix)
- Rector (with --dry-run=false)

### Validation Only Mode

```bash
# Check without making changes
./vendor/bin/sail composer qa:validate
```

Runs:
- PHPStan (static analysis)
- PHPMD (code quality)

---

## 1. Laravel Pint - Code Style Fixer

### Overview

**Purpose:** Enforces consistent code formatting across the entire codebase.

**Configuration:** `pint.json`

**Standard:** PSR-12 with Laravel-specific conventions

### Commands

```bash
# Check style issues without fixing
./vendor/bin/sail composer pint:test

# Auto-fix all style issues
./vendor/bin/sail composer pint

# Check specific directory
./vendor/bin/sail pint app/Models

# Check specific file
./vendor/bin/sail pint app/Models/Product.php
```

### Rules Applied

- **PSR-12 Compliance:** Standard PHP code style
- **Ordered Imports:** Alphabetically sorted use statements
- **Trailing Commas:** In multi-line arrays and parameters
- **Proper Spacing:** Consistent indentation and line breaks
- **Laravel Conventions:** Framework-specific formatting

### Configuration

**File:** `pint.json`

```json
{
  "preset": "laravel",
  "rules": {
    "trailing_comma_in_multiline": true,
    "ordered_imports": {
      "sort_algorithm": "alpha"
    },
    "no_unused_imports": true,
    "blank_line_after_namespace": true,
    "blank_line_after_opening_tag": true
  }
}
```

### What It Fixes

✅ **Before Pint:**
```php
<?php
use App\Models\Product;
use Illuminate\Http\Request;
use App\Models\User;

class ProductController extends Controller {
    public function index(Request $request) {
        $products=Product::all();
        return view('products',['products'=>$products]);
    }
}
```

✅ **After Pint:**
```php
<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::all();
        
        return view('products', ['products' => $products]);
    }
}
```

### Status

- ✅ **0 style issues**
- ✅ All files PSR-12 compliant
- ⚡️ Fast execution (~2 seconds)

---

## 2. PHPStan with Larastan - Static Analysis

### Overview

**Purpose:** Find bugs and type errors without running the code.

**Configuration:** `phpstan.neon`, `phpstan-baseline.neon`

**Current Level:** 6 (out of 9)

**Extensions:** Larastan for Laravel magic method understanding

### Commands

```bash
# Run static analysis
./vendor/bin/sail composer phpstan

# Analyze specific file
./vendor/bin/sail phpstan analyze app/Models/Product.php

# Generate baseline (for legacy code)
./vendor/bin/sail composer phpstan:baseline

# Clear result cache
./vendor/bin/sail phpstan clear-result-cache
```

### PHPStan Levels

| Level | Checks |
|-------|--------|
| 0 | Basic checks, unknown classes |
| 1 | Unknown methods on classes |
| 2 | Unknown methods called on `$this` |
| 3 | Return types, property types |
| 4 | Basic dead code detection |
| 5 | Checking types of arguments |
| **6** | **Missing typehints** ← Current |
| 7 | Partially incorrect union types |
| 8 | Calling methods on nullable types |
| 9 | Strict rules for everything |

### What It Catches

```php
// ❌ Type mismatch
function addNumbers(int $a, int $b): int {
    return $a . $b;  // PHPStan: Returns string, not int
}

// ❌ Undefined method
$user = new User();
$user->nonExistentMethod();  // PHPStan: Method doesn't exist

// ❌ Null pointer errors
function getName(?User $user): string {
    return $user->name;  // PHPStan: $user might be null
}

// ✅ Correct with null check
function getName(?User $user): string {
    return $user?->name ?? 'Guest';
}
```

### Configuration

**File:** `phpstan.neon`

```neon
includes:
    - ./vendor/larastan/larastan/extension.neon
    - phpstan-baseline.neon

parameters:
    level: 6
    paths:
        - app
        - config
        - database
        - routes
        - tests
    
    excludePaths:
        - bootstrap
        - storage
        - vendor
    
    ignoreErrors:
        - '#Unsafe usage of new static#'
```

### Baseline Management

**When to use baseline:**
- Introducing PHPStan to existing project
- Upgrading PHPStan level
- Temporary ignoring specific issues

**Generate baseline:**
```bash
./vendor/bin/sail composer phpstan:baseline
```

This creates `phpstan-baseline.neon` with current errors.

**Goal:** Reduce baseline to 0 errors over time.

### Status

- ✅ **0 errors at level 6**
- ✅ 15 framework warnings baselined
- 🎯 Target: Level 8 eventually

---

## 3. PHPMD - PHP Mess Detector

### Overview

**Purpose:** Detect code quality issues, anti-patterns, and code smells.

**Configuration:** `phpmd.xml`

### Commands

```bash
# Console output
./vendor/bin/sail composer phpmd

# Generate HTML report
./vendor/bin/sail composer phpmd:html

# Check specific directory
./vendor/bin/sail phpmd app text phpmd.xml

# Check specific ruleset
./vendor/bin/sail phpmd app text codesize
```

### Rule Categories

#### 1. Code Size Rules

**Thresholds:**
- Max method length: 150 lines
- Max class length: 1000 lines
- Max parameters: 10
- Cyclomatic complexity: 15

**What it prevents:**
- Overly long methods (hard to test)
- God classes (too many responsibilities)
- Methods with too many parameters

#### 2. Clean Code Rules

**Rules:**
- No else expressions (prefer early returns)
- No static access (except Laravel facades)
- Boolean argument simplification

**Example:**

❌ **Complex conditionals:**
```php
public function getPrice($product, $discount) {
    if ($discount) {
        return $product->price * 0.9;
    } else {
        return $product->price;
    }
}
```

✅ **Early return:**
```php
public function getPrice($product, $discount) {
    if ($discount) {
        return $product->price * 0.9;
    }
    
    return $product->price;
}
```

#### 3. Design Rules

**Metrics:**
- Coupling between objects: ≤20
- Depth of inheritance: ≤6
- Number of children: ≤20

**Purpose:** Maintain loose coupling and avoid deep inheritance hierarchies.

#### 4. Naming Rules

**Conventions:**
- Variable names: 2-20 characters
- No short names like `$a`, `$b`
- Constructor name shouldn't match class (use `__construct`)

#### 5. Unused Code Rules

**Detects:**
- Unused parameters
- Unused local variables
- Unused private methods

**Exception:** `UnusedFormalParameter` excluded for interfaces

### Configuration

**File:** `phpmd.xml`

```xml
<?xml version="1.0"?>
<ruleset name="Project Rules">
    <!-- Code Size -->
    <rule ref="rulesets/codesize.xml">
        <exclude name="TooManyPublicMethods"/>
    </rule>
    
    <!-- Clean Code -->
    <rule ref="rulesets/cleancode.xml">
        <exclude name="StaticAccess"/>  <!-- Laravel facades -->
    </rule>
    
    <!-- Design -->
    <rule ref="rulesets/design.xml"/>
    
    <!-- Naming -->
    <rule ref="rulesets/naming.xml">
        <exclude name="ShortVariable"/>
    </rule>
    
    <!-- Unused Code -->
    <rule ref="rulesets/unusedcode.xml">
        <exclude name="UnusedFormalParameter"/>  <!-- Interfaces -->
    </rule>
</ruleset>
```

### HTML Report

View detailed report:

```bash
./vendor/bin/sail composer phpmd:html
open phpmd-report.html
```

Report includes:
- Violation counts by category
- Specific line numbers
- Severity levels
- Improvement suggestions

### Status

- ✅ **0 warnings**
- ✅ Custom Laravel exclusions configured
- ✅ Interface parameters excluded

---

## 4. Rector - Automated Refactoring

### Overview

**Purpose:** Automatically upgrade code and apply best practices.

**Configuration:** `rector.php`

### Commands

```bash
# Dry run (preview changes)
./vendor/bin/sail composer rector

# Apply refactorings
./vendor/bin/sail composer rector:fix

# Process specific directory
./vendor/bin/sail rector process app/Models --dry-run

# Clear cache
./vendor/bin/sail rector clear-cache
```

### Applied Rule Sets

#### PHP 8.2 Upgrades
- Readonly properties
- New initializers in constructors
- Null-safe operator
- Match expressions

#### Laravel 12 Patterns
- `fake()` helper instead of `$this->faker`
- `resolve()` instead of `app()`
- `casts()` method for model casting
- Date facade instead of Carbon
- Modern validation arrays

#### Code Quality
- Arrow function conversions
- Dead code removal
- Type declarations
- Property promotion

#### Early Return
- Simplified conditional logic
- Reduced nesting
- Improved readability

### What It Does

**Example transformations:**

❌ **Before Rector:**
```php
use Illuminate\Support\Carbon;

class ProductFactory extends Factory
{
    protected $model = Product::class;
    
    public function definition()
    {
        return [
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}
```

✅ **After Rector:**
```php
use Illuminate\Support\Facades\Date;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'created_at' => Date::now(),
            'updated_at' => Date::now(),
        ];
    }
}
```

### Configuration

**File:** `rector.php`

```php
use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Set\ValueObject\SetList;
use RectorLaravel\Set\LaravelLevelSetList;
use RectorLaravel\Set\LaravelSetList;

return RectorConfig::configure()
    ->withPaths([
        __DIR__.'/app',
        __DIR__.'/config',
        __DIR__.'/database',
        __DIR__.'/routes',
        __DIR__.'/tests',
    ])
    ->withSets([
        LevelSetList::UP_TO_PHP_82,
        SetList::CODE_QUALITY,
        SetList::DEAD_CODE,
        SetList::EARLY_RETURN,
        LaravelLevelSetList::UP_TO_LARAVEL_120,
        LaravelSetList::LARAVEL_CODE_QUALITY,
    ]);
```

### Status

- ✅ 23 files refactored
- ✅ Laravel 12 patterns applied
- ✅ All tests passing after refactoring

---

## CI/CD Integration

### GitHub Actions

**File:** `.github/workflows/quality.yml`

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.2
          extensions: mbstring, pdo, pdo_mysql
      
      - name: Install Dependencies
        run: composer install --prefer-dist --no-progress
      
      - name: Code Style Check
        run: composer pint:test
      
      - name: Static Analysis
        run: composer phpstan
      
      - name: Code Quality Check
        run: composer phpmd
      
      - name: Run Tests
        run: composer test
```

---

## Pre-commit Hooks

### Setup Git Hook

**Create file:** `.git/hooks/pre-commit`

```bash
#!/bin/sh

echo "🔍 Running quality checks..."

# Check code style
./vendor/bin/sail composer pint:test
if [ $? -ne 0 ]; then
    echo "❌ Code style issues found. Run 'composer pint' to fix."
    exit 1
fi

# Run static analysis
./vendor/bin/sail composer phpstan
if [ $? -ne 0 ]; then
    echo "❌ PHPStan found issues."
    exit 1
fi

# Run tests
./vendor/bin/sail composer test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed."
    exit 1
fi

echo "✅ All checks passed!"
exit 0
```

**Make executable:**
```bash
chmod +x .git/hooks/pre-commit
```

---

## IDE Integration

### PHPStorm/IntelliJ IDEA

#### PHPStan Integration
1. **Settings → PHP → Quality Tools → PHPStan**
2. Configuration:
   - Path to executable: `vendor/bin/phpstan`
   - Configuration file: `phpstan.neon`
3. Enable: Settings → Editor → Inspections → PHPStan

#### Pint Integration
1. **Settings → Tools → External Tools**
2. Add Tool:
   - Name: Pint
   - Program: `vendor/bin/pint`
   - Arguments: `$FilePath$`
   - Working directory: `$ProjectFileDir$`

3. **Keyboard Shortcut:**
   - Settings → Keymap
   - External Tools → Pint
   - Add shortcut (e.g., Ctrl+Alt+L)

#### PHPMD Integration
1. **Settings → PHP → Quality Tools → Mess Detector**
2. Configuration:
   - Path to executable: `vendor/bin/phpmd`
   - Ruleset: `phpmd.xml`
3. Enable: Settings → Editor → Inspections → PHP Mess Detector

### VS Code

#### Install Extensions
- PHP Intelephense
- Laravel Extra Intellisense
- PHPStan (by SanderRonde)
- PHP CS Fixer

#### Settings

**File:** `.vscode/settings.json`

```json
{
  "php.validate.executablePath": "./vendor/bin/php",
  "phpstan.enabled": true,
  "phpstan.configFile": "phpstan.neon",
  "phpstan.binPath": "./vendor/bin/phpstan",
  "intelephense.diagnostics.enable": true,
  "editor.formatOnSave": true,
  "[php]": {
    "editor.defaultFormatter": "bmewburn.vscode-intelephense-client"
  }
}
```

#### Tasks

**File:** `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Pint",
      "type": "shell",
      "command": "./vendor/bin/pint",
      "group": "build"
    },
    {
      "label": "PHPStan",
      "type": "shell",
      "command": "./vendor/bin/phpstan analyze",
      "group": "test"
    },
    {
      "label": "Quality Check",
      "type": "shell",
      "command": "composer qa:full",
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

---

## Best Practices

### Before Committing

```bash
# Run complete quality suite
./vendor/bin/sail composer qa:full
```

### During Development

```bash
# Quick auto-fix
./vendor/bin/sail composer qa:fix

# Then validate
./vendor/bin/sail composer qa:validate
```

### Before Pull Requests

**Checklist:**
- [ ] Run `composer qa:full`
- [ ] All quality checks passing
- [ ] No new PHPStan errors
- [ ] No PHPMD warnings
- [ ] Code style compliant (Pint)
- [ ] All tests passing (135 PHPUnit + 253 Jest)
- [ ] Test coverage maintained

### Code Review Checklist

- [ ] Quality tools passed in CI/CD
- [ ] No suppressions added without justification
- [ ] Type hints present on all methods
- [ ] No overly complex methods (cyclomatic complexity ≤15)
- [ ] No code duplication
- [ ] Test coverage for new features

---

## Troubleshooting

### PHPStan Memory Issues

```bash
# Increase memory limit
./vendor/bin/sail php -d memory_limit=2G vendor/bin/phpstan analyze
```

### Pint Not Fixing Files

```bash
# Clear cache
rm -rf .php-cs-fixer.cache

# Run again
./vendor/bin/sail composer pint
```

### PHPMD Taking Too Long

```bash
# Check specific directory
./vendor/bin/sail phpmd app text phpmd.xml

# Or specific file
./vendor/bin/sail phpmd app/Models/Product.php text phpmd.xml
```

### Rector Breaking Tests

```bash
# Always dry-run first
./vendor/bin/sail composer rector

# Review changes carefully
git diff

# Run tests after applying
./vendor/bin/sail composer rector:fix
./vendor/bin/sail composer test
```

---

## Quality Metrics

### Current Status

- ✅ **Pint:** 0 style issues
- ✅ **PHPStan:** 0 errors (Level 6)
- ✅ **PHPMD:** 0 warnings
- ✅ **Rector:** 23 files refactored, all patterns applied
- ✅ **PHPUnit:** 135/135 tests passing
- ✅ **Jest:** 253/253 tests passing
- ✅ **Coverage:** ~85% overall

### Goals

- 🎯 Reach PHPStan Level 8
- 🎯 Maintain 0 warnings across all tools
- 🎯 Keep test coverage above 80%
- 🎯 Add more integration tests
- 🎯 Reduce PHPStan baseline to 0

---

## Related Documentation

- [Testing Guide](TESTING.md)
- [Development Commands](DEVELOPMENT.md)
- [Installation Guide](INSTALLATION.md)
- [Troubleshooting](TROUBLESHOOTING.md)
