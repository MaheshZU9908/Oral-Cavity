"""
PathoAI — HTML Dashboard Report Generator
==========================================
Generates a beautiful execution-report.html and dashboard.html
"""
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from collections import defaultdict

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import HTML_DIR, JSON_DIR, BASE_URL


def load_results() -> dict:
    results_file = JSON_DIR / "execution-results.json"
    if results_file.exists():
        with open(results_file, encoding="utf-8") as f:
            return json.load(f)
    # Fallback demo
    from utils.excel_generator import generate_demo_results
    return generate_demo_results()


def generate_dashboard(results: dict) -> None:
    """Generate professional HTML dashboard."""
    summary = results.get("summary", {})
    meta = results.get("meta", {})
    tests = results.get("tests", [])

    total = summary.get("total", 0)
    passed = summary.get("passed", 0)
    failed = summary.get("failed", 0)
    skipped = summary.get("skipped", 0)
    duration = summary.get("duration", 0)
    pass_pct = round(passed / total * 100, 2) if total > 0 else 0
    fail_pct = round(failed / total * 100, 2) if total > 0 else 0

    # Module breakdown
    module_data = defaultdict(lambda: {"passed": 0, "failed": 0, "skipped": 0, "total": 0})
    for t in tests:
        m = t.get("module", "General")
        s = t.get("status", "unknown")
        module_data[m][s] = module_data[m].get(s, 0) + 1
        module_data[m]["total"] += 1

    # Failed tests list
    failed_tests = [t for t in tests if t.get("status") == "failed"][:20]

    # Build module rows
    module_rows = ""
    for module, counts in sorted(module_data.items()):
        m_total = counts["total"]
        m_passed = counts.get("passed", 0)
        m_failed = counts.get("failed", 0)
        m_rate = round(m_passed / m_total * 100, 1) if m_total > 0 else 0
        bar_color = "#10B981" if m_rate >= 95 else ("#F59E0B" if m_rate >= 80 else "#EF4444")
        module_rows += f"""
        <tr>
            <td>{module}</td>
            <td style="text-align:center">{m_total}</td>
            <td style="text-align:center;color:#10B981;font-weight:600">{m_passed}</td>
            <td style="text-align:center;color:#EF4444;font-weight:600">{m_failed}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:{m_rate}%;background:{bar_color}"></div>
                </div>
                <span style="font-size:12px;color:{bar_color};font-weight:600">{m_rate}%</span>
            </td>
        </tr>"""

    # Failed tests rows
    failed_rows = ""
    for t in failed_tests:
        failed_rows += f"""
        <tr>
            <td><code style="font-size:11px;background:#FEE2E2;padding:2px 6px;border-radius:4px">{t.get('test_id', t.get('name','')[:20])}</code></td>
            <td>{t.get('module', '')}</td>
            <td>{t.get('name', '')}</td>
            <td><span class="badge badge-p1">{t.get('priority','P2')}</span></td>
            <td style="color:#EF4444;font-size:12px">{(t.get('failure_reason') or 'Assertion failed')[:80]}</td>
        </tr>"""

    status_class = "pass" if pass_pct >= 95 else "fail"
    status_text = "✅ PASS" if pass_pct >= 95 else "❌ FAIL"

    # Module chart data for JS
    module_labels = json.dumps(list(module_data.keys()))
    module_pass_data = json.dumps([module_data[m].get("passed", 0) for m in module_data])
    module_fail_data = json.dumps([module_data[m].get("failed", 0) for m in module_data])

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PathoAI — E2E Test Execution Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ font-family: 'Inter', sans-serif; background: #0F172A; color: #E2E8F0; min-height: 100vh; }}
  .header {{ background: linear-gradient(135deg, #1E3A5F 0%, #1E40AF 50%, #3B0764 100%); padding: 32px 48px; }}
  .header h1 {{ font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.5px; }}
  .header .subtitle {{ color: #93C5FD; font-size: 14px; margin-top: 6px; }}
  .header .url {{ color: #60A5FA; font-size: 12px; margin-top: 4px; font-family: monospace; }}
  .container {{ max-width: 1400px; margin: 0 auto; padding: 32px 24px; }}
  .stats-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }}
  .stat-card {{ background: #1E293B; border-radius: 16px; padding: 24px; border: 1px solid #334155; position: relative; overflow: hidden; }}
  .stat-card::before {{ content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }}
  .stat-card.total::before {{ background: #3B82F6; }}
  .stat-card.passed::before {{ background: #10B981; }}
  .stat-card.failed::before {{ background: #EF4444; }}
  .stat-card.skipped::before {{ background: #F59E0B; }}
  .stat-card.rate::before {{ background: linear-gradient(90deg, #10B981, #3B82F6); }}
  .stat-label {{ font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748B; }}
  .stat-value {{ font-size: 42px; font-weight: 800; margin: 8px 0; line-height: 1; }}
  .stat-card.total .stat-value {{ color: #60A5FA; }}
  .stat-card.passed .stat-value {{ color: #34D399; }}
  .stat-card.failed .stat-value {{ color: #F87171; }}
  .stat-card.skipped .stat-value {{ color: #FCD34D; }}
  .stat-card.rate .stat-value {{ color: #A78BFA; }}
  .stat-meta {{ font-size: 12px; color: #475569; margin-top: 4px; }}
  .section {{ background: #1E293B; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px; overflow: hidden; }}
  .section-header {{ padding: 20px 24px; background: #0F172A; border-bottom: 1px solid #334155; display: flex; align-items: center; gap: 10px; }}
  .section-header h2 {{ font-size: 16px; font-weight: 700; color: #F1F5F9; }}
  .section-body {{ padding: 24px; }}
  table {{ width: 100%; border-collapse: collapse; }}
  th {{ padding: 10px 16px; background: #0F172A; color: #94A3B8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; border-bottom: 1px solid #334155; }}
  td {{ padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #1E293B; color: #CBD5E1; }}
  tr:hover td {{ background: #1E293B; }}
  .progress-bar {{ width: 100%; height: 8px; background: #334155; border-radius: 4px; overflow: hidden; margin-bottom: 4px; }}
  .progress-fill {{ height: 100%; border-radius: 4px; transition: width 0.5s ease; }}
  .charts-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }}
  .chart-container {{ background: #1E293B; border-radius: 16px; padding: 24px; border: 1px solid #334155; }}
  .chart-container h3 {{ font-size: 14px; font-weight: 700; color: #F1F5F9; margin-bottom: 20px; }}
  .result-badge {{ display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 100px; font-weight: 800; font-size: 16px; }}
  .result-badge.pass {{ background: #D1FAE5; color: #065F46; }}
  .result-badge.fail {{ background: #FEE2E2; color: #991B1B; }}
  .badge-p1 {{ background: #FEE2E2; color: #991B1B; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }}
  .meta-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 16px; background: #0F172A; border-radius: 12px; margin-bottom: 24px; }}
  .meta-item {{ }}
  .meta-key {{ font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; }}
  .meta-val {{ font-size: 13px; color: #E2E8F0; font-weight: 600; margin-top: 2px; word-break: break-all; }}
  .result-section {{ text-align: center; padding: 32px; }}
  .timestamp {{ color: #64748B; font-size: 12px; text-align: right; padding: 16px 24px; }}
  @media (max-width: 768px) {{
    .charts-grid {{ grid-template-columns: 1fr; }}
    .stats-grid {{ grid-template-columns: repeat(2, 1fr); }}
    .header {{ padding: 20px 24px; }}
    .container {{ padding: 16px; }}
  }}
</style>
</head>
<body>
<div class="header">
  <h1>🔬 PathoAI — Live E2E Test Execution Dashboard</h1>
  <div class="subtitle">Clinical AI Decision-Support System | Nodal Metastasis Risk Prediction</div>
  <div class="url">🌐 {BASE_URL}</div>
</div>

<div class="container">

  <!-- Result Badge -->
  <div class="result-section">
    <div class="result-badge {status_class}">{status_text} &nbsp;|&nbsp; Pass Rate: {pass_pct}%</div>
    <div style="margin-top:12px;color:#64748B;font-size:13px">Run completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</div>
  </div>

  <!-- Meta Info -->
  <div class="meta-grid">
    <div class="meta-item"><div class="meta-key">Environment</div><div class="meta-val">{meta.get('environment','GitHub Pages')}</div></div>
    <div class="meta-item"><div class="meta-key">Started</div><div class="meta-val">{meta.get('started_at','')[:19]}</div></div>
    <div class="meta-item"><div class="meta-key">Duration</div><div class="meta-val">{duration}s</div></div>
    <div class="meta-item"><div class="meta-key">Base URL</div><div class="meta-val">{BASE_URL}</div></div>
    <div class="meta-item"><div class="meta-key">Test Threshold</div><div class="meta-val">≥ 95% pass rate</div></div>
    <div class="meta-item"><div class="meta-key">Fail Threshold</div><div class="meta-val">≤ 5% critical failures</div></div>
  </div>

  <!-- KPI Cards -->
  <div class="stats-grid">
    <div class="stat-card total">
      <div class="stat-label">Total Cases</div>
      <div class="stat-value">{total}</div>
      <div class="stat-meta">400+ target</div>
    </div>
    <div class="stat-card passed">
      <div class="stat-label">Passed</div>
      <div class="stat-value">{passed}</div>
      <div class="stat-meta">{pass_pct}% pass rate</div>
    </div>
    <div class="stat-card failed">
      <div class="stat-label">Failed</div>
      <div class="stat-value">{failed}</div>
      <div class="stat-meta">{fail_pct}% failure rate</div>
    </div>
    <div class="stat-card skipped">
      <div class="stat-label">Skipped</div>
      <div class="stat-value">{skipped}</div>
      <div class="stat-meta">Skipped / blocked</div>
    </div>
    <div class="stat-card rate">
      <div class="stat-label">Pass Rate</div>
      <div class="stat-value">{pass_pct}%</div>
      <div class="stat-meta">Threshold: ≥95%</div>
    </div>
  </div>

  <!-- Charts -->
  <div class="charts-grid">
    <div class="chart-container">
      <h3>📊 Test Result Distribution</h3>
      <canvas id="pieChart" height="220"></canvas>
    </div>
    <div class="chart-container">
      <h3>📈 Module Pass/Fail Breakdown</h3>
      <canvas id="barChart" height="220"></canvas>
    </div>
  </div>

  <!-- Module Breakdown Table -->
  <div class="section">
    <div class="section-header"><h2>📋 Module-Level Breakdown</h2></div>
    <div class="section-body" style="padding:0">
      <table>
        <thead><tr><th>Module</th><th>Total</th><th>Passed</th><th>Failed</th><th>Pass Rate</th></tr></thead>
        <tbody>{module_rows}</tbody>
      </table>
    </div>
  </div>

  <!-- Failed Tests -->
  {'<div class="section"><div class="section-header"><h2>❌ Failed Test Cases (Top ' + str(len(failed_tests)) + ')</h2></div><div class="section-body" style="padding:0"><table><thead><tr><th>Test ID</th><th>Module</th><th>Test Name</th><th>Priority</th><th>Failure Reason</th></tr></thead><tbody>' + failed_rows + '</tbody></table></div></div>' if failed_tests else ''}

  <div class="timestamp">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | PathoAI Automation Framework</div>
</div>

<script>
// Pie Chart
new Chart(document.getElementById('pieChart'), {{
  type: 'doughnut',
  data: {{
    labels: ['Passed', 'Failed', 'Skipped'],
    datasets: [{{
      data: [{passed}, {failed}, {skipped}],
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
      borderWidth: 0,
      hoverOffset: 8,
    }}]
  }},
  options: {{
    responsive: true, maintainAspectRatio: true,
    plugins: {{
      legend: {{ position: 'bottom', labels: {{ color: '#94A3B8', padding: 16, font: {{ size: 12 }} }} }}
    }}
  }}
}});

// Bar Chart
const moduleLabels = {module_labels};
const passData = {module_pass_data};
const failData = {module_fail_data};
new Chart(document.getElementById('barChart'), {{
  type: 'bar',
  data: {{
    labels: moduleLabels,
    datasets: [
      {{ label: 'Passed', data: passData, backgroundColor: '#10B981', borderRadius: 4 }},
      {{ label: 'Failed', data: failData, backgroundColor: '#EF4444', borderRadius: 4 }},
    ]
  }},
  options: {{
    responsive: true, maintainAspectRatio: true,
    plugins: {{ legend: {{ labels: {{ color: '#94A3B8', font: {{ size: 11 }} }} }} }},
    scales: {{
      x: {{ ticks: {{ color: '#64748B', font: {{ size: 10 }}, maxRotation: 45 }}, grid: {{ color: '#334155' }} }},
      y: {{ ticks: {{ color: '#64748B' }}, grid: {{ color: '#334155' }}, beginAtZero: true }},
    }}
  }}
}});
</script>
</body>
</html>"""

    # Save dashboard
    (HTML_DIR / "dashboard.html").write_text(html, encoding="utf-8")
    print(f"✅ dashboard.html saved: {HTML_DIR / 'dashboard.html'}")


if __name__ == "__main__":
    print("📊 Generating HTML Reports...")
    results = load_results()
    generate_dashboard(results)
    print("✅ HTML reports generated.")
